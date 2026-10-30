import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { emergencyService } from '../services/emergencyService.js';
import { Dispatch112RequestSchema } from '@safewalk/validation';

export const emergencyRouter = Router();

// GET /integrations/emergency
emergencyRouter.get('/emergency', authenticate, (_req: AuthenticatedRequest, res: Response) => {
  const list = Array.from(dbStore.integrations.values());
  return res.json(list);
});

// POST /integrations/emergency/:id/dispatch
emergencyRouter.post('/emergency/:id/dispatch', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id: integrationId } = req.params;
    const { incident_id } = req.body;
    const user = req.user!;

    const incident = dbStore.incidents.get(incident_id);
    if (!incident) {
      return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
    }

    const locations = dbStore.locations.get(incident_id) || [];
    const latestLocation = locations.length > 0 ? locations[locations.length - 1] : null;
    const evidence = dbStore.evidence.get(incident_id) || [];

    const dispatch = await emergencyService.dispatchIncident(incident, user, latestLocation, evidence.length > 0);
    return res.status(201).json(dispatch);
  } catch (err) {
    next(err);
  }
});

// GET /incidents/:id/dispatch-status
emergencyRouter.get('/incidents/:id/dispatch-status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const dispatch = emergencyService.getDispatchForIncident(id);
  return res.json(dispatch || { status: 'none', message: 'No emergency integration dispatch submitted for this incident' });
});
