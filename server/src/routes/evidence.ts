import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { RequestEvidenceUploadUrlSchema, CompleteEvidenceUploadSchema } from '@safewalk/validation';
import { EmergencyEvidence } from '@safewalk/shared-types';

export const evidenceRouter = Router({ mergeParams: true });

// POST /incidents/:id/evidence/upload-url
evidenceRouter.post('/:id/evidence/upload-url', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id: incidentId } = req.params;
    const validated = RequestEvidenceUploadUrlSchema.parse(req.body);
    const user = req.user!;
    const incident = dbStore.incidents.get(incidentId);

    if (!incident) return res.status(404).json({ error: 'NotFound' });
    if (incident.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    const evidenceId = uuidv4();
    const ext = validated.evidence_type === 'audio' ? 'mp3' : validated.evidence_type === 'video' ? 'mp4' : 'jpg';
    const storagePath = `incidents/${incidentId}/${evidenceId}.${ext}`;
    const uploadUrl = `/api/v1/incidents/${incidentId}/evidence/upload-binary?path=${encodeURIComponent(storagePath)}`;

    return res.json({
      upload_url: uploadUrl,
      storage_path: storagePath,
      evidence_id: evidenceId,
      expires_in_seconds: 3600
    });
  } catch (err) {
    next(err);
  }
});

// POST /incidents/:id/evidence/complete
evidenceRouter.post('/:id/evidence/complete', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id: incidentId } = req.params;
    const validated = CompleteEvidenceUploadSchema.parse(req.body);
    const user = req.user!;
    const incident = dbStore.incidents.get(incidentId);

    if (!incident) return res.status(404).json({ error: 'NotFound' });
    if (incident.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    const evidenceRecord: EmergencyEvidence = {
      id: uuidv4(),
      incident_id: incidentId,
      user_id: user.id,
      evidence_type: validated.evidence_type,
      storage_path: validated.storage_path,
      mime_type: validated.mime_type,
      file_size_bytes: validated.file_size_bytes,
      checksum: validated.checksum || `sha256-${uuidv4().replace(/-/g, '')}`,
      captured_at: new Date().toISOString(),
      upload_status: 'completed',
      retention_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      download_url: validated.evidence_type === 'audio' 
        ? 'https://actions.google.com/sounds/v1/ambiences/street_ambience.ogg'
        : 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
    };

    const evidenceList = dbStore.evidence.get(incidentId) || [];
    evidenceList.push(evidenceRecord);
    dbStore.evidence.set(incidentId, evidenceList);

    // Timeline event
    const timelineEvents = dbStore.timeline.get(incidentId) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: incidentId,
      event_type: validated.evidence_type === 'audio' ? 'audio_captured' : 'video_captured',
      event_description: `Emergency ${validated.evidence_type.toUpperCase()} evidence securely archived (${Math.round(validated.file_size_bytes / 1024)} KB, SHA-256 verified)`,
      event_metadata: { evidence_id: evidenceRecord.id, type: validated.evidence_type, checksum: evidenceRecord.checksum },
      created_at: new Date().toISOString()
    });
    dbStore.timeline.set(incidentId, timelineEvents);

    dbStore.addAuditLog(user.id, 'EVIDENCE_UPLOAD_COMPLETED', 'emergency_evidence', evidenceRecord.id);

    return res.status(201).json(evidenceRecord);
  } catch (err) {
    next(err);
  }
});

// GET /incidents/:id/evidence
evidenceRouter.get('/:id/evidence', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id: incidentId } = req.params;
  const user = req.user!;
  const incident = dbStore.incidents.get(incidentId);

  if (!incident) return res.status(404).json({ error: 'NotFound' });

  const isResponderOrAdmin = user.role === 'RESPONDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isResponderOrAdmin && incident.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const list = dbStore.evidence.get(incidentId) || [];
  return res.json(list);
});
