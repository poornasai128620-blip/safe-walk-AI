import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { SafetySettingsUpdateSchema, ConsentUpdateSchema } from '@safewalk/validation';
import { UserConsent } from '@safewalk/shared-types';

export const safetyRouter = Router();

// GET /safety/settings
safetyRouter.get('/settings', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const stored = dbStore.users.get(req.user!.id);
  return res.json(stored?.safetySettings);
});

// PATCH /safety/settings
safetyRouter.patch('/settings', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = SafetySettingsUpdateSchema.parse(req.body);
    const stored = dbStore.users.get(req.user!.id);
    if (!stored) return res.status(404).json({ error: 'NotFound' });

    if (validated.voice_detection_enabled !== undefined) {
      stored.safetySettings.voice_detection_enabled = validated.voice_detection_enabled;
    }
    if (validated.emergency_audio_enabled !== undefined) {
      stored.safetySettings.emergency_audio_enabled = validated.emergency_audio_enabled;
    }
    if (validated.emergency_video_enabled !== undefined) {
      stored.safetySettings.emergency_video_enabled = validated.emergency_video_enabled;
    }
    if (validated.location_sharing_enabled !== undefined) {
      stored.safetySettings.location_sharing_enabled = validated.location_sharing_enabled;
    }
    if (validated.emergency_phrase_config) {
      stored.safetySettings.emergency_phrase_config = validated.emergency_phrase_config;
    }
    stored.safetySettings.updated_at = new Date().toISOString();

    dbStore.addAuditLog(req.user!.id, 'SAFETY_SETTINGS_UPDATED', 'user_safety_settings', stored.safetySettings.id);

    return res.json(stored.safetySettings);
  } catch (err) {
    next(err);
  }
});

// GET /safety/consents
safetyRouter.get('/consents', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const stored = dbStore.users.get(req.user!.id);
  return res.json(stored?.consents || []);
});

// POST /safety/consents
safetyRouter.post('/consents', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = ConsentUpdateSchema.parse(req.body);
    const stored = dbStore.users.get(req.user!.id);
    if (!stored) return res.status(404).json({ error: 'NotFound' });

    let consent = stored.consents.find(c => c.consent_type === validated.consent_type);
    if (consent) {
      consent.granted = validated.granted;
      consent.consent_version = validated.consent_version;
      if (validated.granted) {
        consent.granted_at = new Date().toISOString();
        consent.revoked_at = null;
      } else {
        consent.revoked_at = new Date().toISOString();
      }
    } else {
      consent = {
        id: uuidv4(),
        user_id: req.user!.id,
        consent_type: validated.consent_type,
        granted: validated.granted,
        consent_version: validated.consent_version,
        granted_at: new Date().toISOString(),
        revoked_at: validated.granted ? null : new Date().toISOString()
      };
      stored.consents.push(consent);
    }

    dbStore.addAuditLog(req.user!.id, 'USER_CONSENT_MODIFIED', 'user_consents', consent.id, {
      type: validated.consent_type,
      granted: validated.granted
    });

    return res.json(consent);
  } catch (err) {
    next(err);
  }
});
