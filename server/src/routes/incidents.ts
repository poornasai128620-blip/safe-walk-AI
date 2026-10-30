import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { emergencyLimiter } from '../middleware/rateLimiter.js';
import { CreateIncidentSchema, IncidentStatusUpdateSchema } from '@safewalk/validation';
import { emergencyService } from '../services/emergencyService.js';
import { notificationService } from '../services/notificationService.js';
import { cctvService } from '../services/cctvService.js';
import { EmergencyIncident, IncidentLocation, IncidentTimelineItem } from '@safewalk/shared-types';

export const incidentsRouter = Router();

// Track idempotency keys for 24h
const idempotencyStore = new Map<string, string>(); // key -> incidentId

// POST /incidents (Emergency SOS Activation)
incidentsRouter.post('/', emergencyLimiter, authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = CreateIncidentSchema.parse(req.body);
    const user = req.user!;

    // Idempotency check
    if (validated.idempotency_key && idempotencyStore.has(validated.idempotency_key)) {
      const existingId = idempotencyStore.get(validated.idempotency_key)!;
      const existingIncident = dbStore.incidents.get(existingId);
      if (existingIncident) {
        return res.status(200).json(existingIncident);
      }
    }

    const incidentId = uuidv4();
    const now = new Date().toISOString();

    const incident: EmergencyIncident = {
      id: incidentId,
      user_id: user.id,
      incident_category: validated.incident_category,
      activation_method: validated.activation_method,
      severity: validated.severity,
      status: 'active',
      description: validated.description || null,
      started_at: now,
      created_at: now,
      updated_at: now
    };

    dbStore.incidents.set(incidentId, incident);
    if (validated.idempotency_key) {
      idempotencyStore.set(validated.idempotency_key, incidentId);
    }

    // 1. Initial Timeline Event
    const initialTimeline: IncidentTimelineItem[] = [{
      id: uuidv4(),
      incident_id: incidentId,
      event_type: 'sos_triggered',
      event_description: `Emergency incident initiated via ${validated.activation_method} (${validated.incident_category})`,
      event_metadata: { category: validated.incident_category, severity: validated.severity },
      created_at: now
    }];
    dbStore.timeline.set(incidentId, initialTimeline);

    // 2. Initial Location if provided
    let savedLocation: IncidentLocation | null = null;
    if (validated.initial_location) {
      savedLocation = {
        id: uuidv4(),
        incident_id: incidentId,
        latitude: validated.initial_location.latitude,
        longitude: validated.initial_location.longitude,
        accuracy_meters: validated.initial_location.accuracy_meters || null,
        altitude_meters: validated.initial_location.altitude_meters || null,
        recorded_at: now
      };
      dbStore.locations.set(incidentId, [savedLocation]);

      initialTimeline.push({
        id: uuidv4(),
        incident_id: incidentId,
        event_type: 'location_updated',
        event_description: `Initial GPS coordinate verified: ${savedLocation.latitude.toFixed(5)}, ${savedLocation.longitude.toFixed(5)} (±${savedLocation.accuracy_meters || 10}m)`,
        event_metadata: { lat: savedLocation.latitude, lon: savedLocation.longitude },
        created_at: now
      });
    }

    // 3. Notify Trusted Contacts in background
    await notificationService.notifyTrustedContacts(incident, user, savedLocation);

    // 4. Dispatch to 112 ERSS if user has police consent
    const stored = dbStore.users.get(user.id);
    const policeConsent = stored?.consents.find(c => c.consent_type === 'police_dispatch_112');
    let dispatchRecord = null;
    if (policeConsent?.granted) {
      dispatchRecord = await emergencyService.dispatchIncident(incident, user, savedLocation, false);
    }

    // Audit Log
    dbStore.addAuditLog(user.id, 'SOS_ACTIVATION', 'emergency_incidents', incidentId, {
      method: validated.activation_method,
      severity: validated.severity,
      category: validated.incident_category
    });

    return res.status(201).json({
      incident,
      latest_location: savedLocation,
      dispatch: dispatchRecord,
      notifications_sent: stored?.contacts.length || 0
    });
  } catch (err) {
    next(err);
  }
});

// GET /incidents
incidentsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  const list: EmergencyIncident[] = [];
  for (const inc of dbStore.incidents.values()) {
    if (isResponderOrAdmin || inc.user_id === user.id) {
      const locations = dbStore.locations.get(inc.id) || [];
      const latestLocation = locations.length > 0 ? locations[locations.length - 1] : undefined;
      const owner = dbStore.users.get(inc.user_id);
      
      list.push({
        ...inc,
        user_profile: owner?.profile,
        latest_location: latestLocation,
        evidence_count: (dbStore.evidence.get(inc.id) || []).length
      });
    }
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json(list);
});

// GET /incidents/:id
incidentsRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const incident = dbStore.incidents.get(id);

  if (!incident) {
    return res.status(404).json({ error: 'NotFound', message: 'Emergency incident not found' });
  }

  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isResponderOrAdmin && incident.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized to view this incident record' });
  }

  const locations = dbStore.locations.get(id) || [];
  const latestLocation = locations.length > 0 ? locations[locations.length - 1] : undefined;
  const owner = dbStore.users.get(incident.user_id);
  const timeline = dbStore.timeline.get(id) || [];
  const evidenceList = dbStore.evidence.get(id) || [];
  const dispatch = emergencyService.getDispatchForIncident(id);
  const cctvRequests = cctvService.getRequestsForIncident(id);

  // Look for nearby authorized cameras if location is available
  let nearbyCameras: Array<unknown> = [];
  if (latestLocation) {
    nearbyCameras = cctvService.findNearbyCameras(latestLocation.latitude, latestLocation.longitude, 1200);
  }

  return res.json({
    ...incident,
    user_profile: owner?.profile,
    latest_location: latestLocation,
    location_history: locations,
    timeline,
    evidence: evidenceList,
    dispatch,
    nearby_cameras: nearbyCameras,
    cctv_requests: cctvRequests
  });
});

// PATCH /incidents/:id/status
incidentsRouter.patch('/:id/status', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = IncidentStatusUpdateSchema.parse(req.body);
    const user = req.user!;
    const incident = dbStore.incidents.get(id);

    if (!incident) {
      return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
    }

    const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isResponderOrAdmin && incident.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    incident.status = status;
    incident.updated_at = new Date().toISOString();
    if (status === 'resolved' || status === 'cancelled') {
      incident.resolved_at = new Date().toISOString();
    }

    // Timeline event
    const timelineEvents = dbStore.timeline.get(id) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: id,
      event_type: status === 'resolved' ? 'resolved' : status === 'cancelled' ? 'cancelled' : 'responder_assigned',
      event_description: `Incident status transitioned to "${status.toUpperCase()}" by ${user.full_name}${reason ? ` (${reason})` : ''}`,
      event_metadata: { updated_by: user.id, status, reason },
      created_at: new Date().toISOString()
    });
    dbStore.timeline.set(id, timelineEvents);

    dbStore.addAuditLog(user.id, 'INCIDENT_STATUS_CHANGE', 'emergency_incidents', id, { status, reason });

    return res.json(incident);
  } catch (err) {
    next(err);
  }
});

// POST /incidents/:id/cancel
incidentsRouter.post('/:id/cancel', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user!;
  const incident = dbStore.incidents.get(id);

  if (!incident) {
    return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
  }

  if (incident.user_id !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  incident.status = 'cancelled';
  incident.resolved_at = new Date().toISOString();
  incident.updated_at = new Date().toISOString();

  await notificationService.notifyCancellation(incident, user, reason);
  dbStore.addAuditLog(user.id, 'INCIDENT_CANCELLED', 'emergency_incidents', id, { reason });

  return res.json({ message: 'Incident successfully cancelled and cancellation updates logged', incident });
});

// POST /incidents/:id/resolve
incidentsRouter.post('/:id/resolve', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { resolution_notes } = req.body;
  const user = req.user!;
  const incident = dbStore.incidents.get(id);

  if (!incident) {
    return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
  }

  incident.status = 'resolved';
  incident.resolved_at = new Date().toISOString();
  incident.updated_at = new Date().toISOString();

  const timelineEvents = dbStore.timeline.get(id) || [];
  timelineEvents.push({
    id: uuidv4(),
    incident_id: id,
    event_type: 'resolved',
    event_description: `Emergency incident closed and marked resolved. Notes: ${resolution_notes || 'All parties reported safe.'}`,
    event_metadata: { resolved_by: user.id, resolution_notes },
    created_at: new Date().toISOString()
  });
  dbStore.timeline.set(id, timelineEvents);

  dbStore.addAuditLog(user.id, 'INCIDENT_RESOLVED', 'emergency_incidents', id, { resolution_notes });

  return res.json({ message: 'Incident resolved successfully', incident });
});
