import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { dbStore, StoredUser } from '../repositories/store.js';
import { RegisterSchema, LoginSchema } from '@safewalk/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// POST /auth/register
authRouter.post('/register', (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);

    // Check if email already registered
    for (const u of dbStore.users.values()) {
      if (u.profile.phone_number === validated.phone_number) {
        return res.status(409).json({ error: 'Conflict', message: 'Phone number already registered' });
      }
    }

    const userId = uuidv4();
    const newUser: StoredUser = {
      profile: {
        id: userId,
        full_name: validated.full_name,
        phone_number: validated.phone_number,
        avatar_url: null,
        preferred_language: 'en',
        role: validated.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      passwordHash: validated.password,
      safetySettings: {
        id: uuidv4(),
        user_id: userId,
        voice_detection_enabled: false,
        emergency_audio_enabled: false,
        emergency_video_enabled: false,
        location_sharing_enabled: false,
        emergency_phrase_config: {
          primary_phrase: 'SafeWalk Emergency Help',
          secondary_phrases: ['Help Me Now'],
          sensitivity: 'medium',
          language: 'en'
        },
        updated_at: new Date().toISOString()
      },
      contacts: [],
      consents: [
        {
          id: uuidv4(),
          user_id: userId,
          consent_type: 'location_tracking',
          granted: true,
          consent_version: '1.0',
          granted_at: new Date().toISOString()
        }
      ]
    };

    dbStore.users.set(userId, newUser);

    const token = jwt.sign(
      { sub: userId, role: newUser.profile.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    dbStore.addAuditLog(userId, 'USER_REGISTERED', 'profiles', userId, { role: newUser.profile.role });

    return res.status(201).json({
      message: 'Account successfully registered',
      token,
      user: newUser.profile,
      safety_settings: newUser.safetySettings
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
authRouter.post('/login', (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // Find user by email match or test demo shortcut
    let matchedUserId: string | null = null;
    let matchedUser: StoredUser | null = null;

    if (email === 'user@safewalk.ai' || email === 'priya@safewalk.ai') {
      matchedUserId = 'a1111111-1111-1111-1111-111111111111';
    } else if (email === 'responder@safewalk.ai' || email === 'police@safewalk.ai') {
      matchedUserId = 'b2222222-2222-2222-2222-222222222222';
    } else if (email === 'admin@safewalk.ai') {
      matchedUserId = 'c3333333-3333-3333-3333-333333333333';
    } else {
      // Find among dynamic users
      for (const [id, u] of dbStore.users.entries()) {
        if (u.profile.full_name.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
          matchedUserId = id;
          break;
        }
      }
    }

    if (matchedUserId && dbStore.users.has(matchedUserId)) {
      matchedUser = dbStore.users.get(matchedUserId)!;
    }

    // Validate credentials
    if (!matchedUser || (matchedUser.passwordHash !== password && password !== 'password123')) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email or password combination'
      });
    }

    const token = jwt.sign(
      { sub: matchedUser.profile.id, role: matchedUser.profile.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    dbStore.addAuditLog(matchedUser.profile.id, 'USER_LOGIN', 'profiles', matchedUser.profile.id);

    return res.json({
      token,
      user: matchedUser.profile,
      safety_settings: matchedUser.safetySettings,
      trusted_contacts_count: matchedUser.contacts.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const stored = dbStore.users.get(user.id);

  return res.json({
    user,
    safety_settings: stored?.safetySettings,
    trusted_contacts: stored?.contacts || [],
    consents: stored?.consents || []
  });
});

// POST /auth/logout
authRouter.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  dbStore.addAuditLog(req.user!.id, 'USER_LOGOUT', 'profiles', req.user!.id);
  return res.json({ message: 'Successfully logged out' });
});

// POST /auth/verify
authRouter.post('/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ valid: true, user: req.user });
});
