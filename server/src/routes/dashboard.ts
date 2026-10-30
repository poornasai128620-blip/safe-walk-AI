import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { emergencyService } from '../services/emergencyService.js';
import { cctvService } from '../services/cctvService.js';
import { EmergencyIncident } from '@safewalk/shared-types';

export const dashboardRouter = Router();

// Require RESPONDER or ADMIN for all dashboard routes
dashboardRouter.use(authenticate);
dashboardRouter.use(requireRole(['RESPONDER', 'ADMIN', 'SUPER_ADMIN']));

// GET /dashboard/overview
dashboardRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const allIncidents = Array.from(dbStore.incidents.values());
  const activeIncidents = allIncidents.filter(i => i.status === 'active');
  const criticalCount = activeIncidents.filter(i => i.severity === 'critical').length;
  const camerasOnline = Array.from(dbStore.cameras.values()).filter(c => c.integration_status === 'online').length;
  const totalEvidence = Array.from(dbStore.evidence.values()).reduce((acc, curr) => acc + curr.length, 0);

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  allIncidents.forEach(inc => {
    categoryBreakdown[inc.incident_category] = (categoryBreakdown[inc.incident_category] || 0) + 1;
  });

  return res.json({
    metrics: {
      total_incidents: allIncidents.length,
      active_incidents: activeIncidents.length,
      critical_active: criticalCount,
      cameras_online: camerasOnline,
      total_evidence_archived: totalEvidence,
      erss_112_link_health: 'connected',
      avg_dispatch_seconds: 1.4
    },
    category_breakdown: categoryBreakdown,
    recent_active: activeIncidents.slice(0, 5).map(inc => {
      const locations = dbStore.locations.get(inc.id) || [];
      const user = dbStore.users.get(inc.user_id);
      return {
        ...inc,
        user_name: user?.profile.full_name || 'Anonymous User',
        user_phone: user?.profile.phone_number,
        latest_location: locations[locations.length - 1]
      };
    })
  });
});

// GET /dashboard/incidents
dashboardRouter.get('/incidents', (_req: AuthenticatedRequest, res: Response) => {
  const list: EmergencyIncident[] = [];
  for (const inc of dbStore.incidents.values()) {
    const locations = dbStore.locations.get(inc.id) || [];
    const owner = dbStore.users.get(inc.user_id);
    list.push({
      ...inc,
      user_profile: owner?.profile,
      latest_location: locations[locations.length - 1],
      evidence_count: (dbStore.evidence.get(inc.id) || []).length
    });
  }
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json(list);
});

// GET /dashboard/incidents/:id
dashboardRouter.get('/incidents/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const incident = dbStore.incidents.get(id);
  if (!incident) return res.status(404).json({ error: 'NotFound' });

  const locations = dbStore.locations.get(id) || [];
  const latestLocation = locations.length > 0 ? locations[locations.length - 1] : undefined;
  const owner = dbStore.users.get(incident.user_id);
  const timeline = dbStore.timeline.get(id) || [];
  const evidenceList = dbStore.evidence.get(id) || [];
  const dispatch = emergencyService.getDispatchForIncident(id);
  const cctvRequests = cctvService.getRequestsForIncident(id);

  let nearbyCameras: Array<unknown> = [];
  if (latestLocation) {
    nearbyCameras = cctvService.findNearbyCameras(latestLocation.latitude, latestLocation.longitude, 1500);
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

// GET /dashboard/audit-logs
dashboardRouter.get('/audit-logs', (_req: AuthenticatedRequest, res: Response) => {
  return res.json(dbStore.auditLogs.slice(0, 100));
});
