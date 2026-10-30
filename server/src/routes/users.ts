import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { UserProfileUpdateSchema } from '@safewalk/validation';

export const usersRouter = Router();

// GET /users/me
usersRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json(req.user);
});

// PATCH /users/me
usersRouter.patch('/me', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = UserProfileUpdateSchema.parse(req.body);
    const stored = dbStore.users.get(req.user!.id);
    if (!stored) {
      return res.status(404).json({ error: 'NotFound', message: 'User profile not found' });
    }

    if (validated.full_name) stored.profile.full_name = validated.full_name;
    if (validated.phone_number) stored.profile.phone_number = validated.phone_number;
    if (validated.avatar_url !== undefined) stored.profile.avatar_url = validated.avatar_url;
    if (validated.preferred_language) stored.profile.preferred_language = validated.preferred_language;
    stored.profile.updated_at = new Date().toISOString();

    dbStore.addAuditLog(req.user!.id, 'USER_PROFILE_UPDATED', 'profiles', req.user!.id);

    return res.json(stored.profile);
  } catch (err) {
    next(err);
  }
});

// DELETE /users/me (Account deletion with consent revocation)
usersRouter.delete('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  dbStore.users.delete(userId);
  dbStore.addAuditLog(userId, 'USER_ACCOUNT_DELETED', 'profiles', userId);
  return res.json({ message: 'User account and associated sensitive credentials deleted successfully' });
});
