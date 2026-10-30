import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { dbStore } from '../repositories/store.js';

export const aiRouter = Router();

// POST /ai/detect-voice-emergency
aiRouter.post('/detect-voice-emergency', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { transcript, language } = req.body;
    const user = req.user!;
    const stored = dbStore.users.get(user.id);
    const phraseConfig = stored?.safetySettings.emergency_phrase_config;

    const phrases: string[] = [];
    if (phraseConfig?.primary_phrase) phrases.push(phraseConfig.primary_phrase);
    if (phraseConfig?.secondary_phrases) phrases.push(...phraseConfig.secondary_phrases);

    const result = await aiService.analyzeSpeechForEmergency(
      transcript || '',
      phrases,
      language || phraseConfig?.language || 'en'
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /ai/analyze-incident
aiRouter.post('/analyze-incident', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { description, available_info } = req.body;
    const result = await aiService.classifyIncident(description || '', available_info);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /ai/summarize-incident
aiRouter.post('/summarize-incident', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { incident_id } = req.body;
    const incident = dbStore.incidents.get(incident_id);
    if (!incident) {
      return res.status(404).json({ error: 'NotFound', message: 'Incident not found' });
    }

    const locations = dbStore.locations.get(incident_id) || [];
    const evidence = dbStore.evidence.get(incident_id) || [];

    const summary = await aiService.generateIncidentSummary({
      ...incident,
      latest_location: locations[locations.length - 1],
      evidence_count: evidence.length
    });

    return res.json(summary);
  } catch (err) {
    next(err);
  }
});

// POST /ai/transcribe
aiRouter.post('/transcribe', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { audio_base64, mime_type } = req.body;
    const buffer = audio_base64 ? Buffer.from(audio_base64, 'base64') : Buffer.from('');
    const result = await aiService.transcribeAudio(buffer, mime_type || 'audio/mp3');
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
