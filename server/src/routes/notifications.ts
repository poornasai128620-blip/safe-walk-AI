import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';

export const notificationsRouter = Router({ mergeParams: true });

// GET /incidents/:id/notifications
notificationsRouter.get('/:id/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const incident = dbStore.incidents.get(id);

  if (!incident) return res.status(404).json({ error: 'NotFound' });

  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isResponderOrAdmin && incident.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const notifs = dbStore.notifications.get(id) || [];
  return res.json(notifs);
});
