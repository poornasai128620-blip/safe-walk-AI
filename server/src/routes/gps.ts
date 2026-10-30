import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { RecordLocationSchema } from '@safewalk/validation';
import { IncidentLocation } from '@safewalk/shared-types';

export const gpsRouter = Router({ mergeParams: true });

// POST /incidents/:id/location
gpsRouter.post('/:id/location', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id: incidentId } = req.params;
    const validated = RecordLocationSchema.parse(req.body);
    const user = req.user!;
    const incident = dbStore.incidents.get(incidentId);

    if (!incident) {
      return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
    }

    if (incident.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Cannot record location for another user incident' });
    }

    if (incident.status !== 'active') {
      return res.status(400).json({ error: 'InvalidState', message: 'Cannot push GPS updates to an inactive or closed incident' });
    }

    const location: IncidentLocation = {
      id: uuidv4(),
      incident_id: incidentId,
      latitude: validated.latitude,
      longitude: validated.longitude,
      accuracy_meters: validated.accuracy_meters || null,
      altitude_meters: validated.altitude_meters || null,
      recorded_at: validated.recorded_at || new Date().toISOString()
    };

    const locations = dbStore.locations.get(incidentId) || [];
    locations.push(location);
    dbStore.locations.set(incidentId, locations);

    // Update timeline
    const timelineEvents = dbStore.timeline.get(incidentId) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: incidentId,
      event_type: 'location_updated',
      event_description: `Location stream updated: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (±${location.accuracy_meters || 10}m)`,
      event_metadata: { lat: location.latitude, lon: location.longitude, accuracy: location.accuracy_meters },
      created_at: location.recorded_at
    });
    dbStore.timeline.set(incidentId, timelineEvents);

    return res.status(201).json(location);
  } catch (err) {
    next(err);
  }
});

// GET /incidents/:id/locations (Track path)
gpsRouter.get('/:id/locations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id: incidentId } = req.params;
  const user = req.user!;
  const incident = dbStore.incidents.get(incidentId);

  if (!incident) return res.status(404).json({ error: 'NotFound' });

  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isResponderOrAdmin && incident.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const locations = dbStore.locations.get(incidentId) || [];
  return res.json(locations);
});

// GET /incidents/:id/location/latest
gpsRouter.get('/:id/location/latest', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id: incidentId } = req.params;
  const user = req.user!;
  const incident = dbStore.incidents.get(incidentId);

  if (!incident) return res.status(404).json({ error: 'NotFound' });

  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isResponderOrAdmin && incident.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const locations = dbStore.locations.get(incidentId) || [];
  const latest = locations.length > 0 ? locations[locations.length - 1] : null;
  return res.json(latest);
});
