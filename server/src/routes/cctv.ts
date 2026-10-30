import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { cctvService } from '../services/cctvService.js';
import { NearbyCameraQuerySchema, CameraAccessRequestSchema } from '@safewalk/validation';
import { AuthorizedCamera } from '@safewalk/shared-types';

export const cctvRouter = Router();

// GET /cameras/nearby?latitude=...&longitude=...&radius_meters=...
cctvRouter.get('/nearby', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { latitude, longitude, radius_meters } = NearbyCameraQuerySchema.parse(req.query);
    const nearby = cctvService.findNearbyCameras(latitude, longitude, radius_meters);
    return res.json(nearby);
  } catch (err) {
    next(err);
  }
});

// GET /cameras (Responders and Admins)
cctvRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const list = Array.from(dbStore.cameras.values());
  return res.json(list);
});

// POST /cameras (Admins only)
cctvRouter.post('/', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { camera_name, provider_name, external_camera_id, latitude, longitude, coverage_radius_meters } = req.body;

  const camera: AuthorizedCamera = {
    id: uuidv4(),
    camera_name,
    provider_name,
    external_camera_id,
    latitude: Number(latitude),
    longitude: Number(longitude),
    coverage_radius_meters: Number(coverage_radius_meters) || 500,
    authorization_status: 'authorized',
    integration_status: 'online',
    created_at: new Date().toISOString()
  };

  dbStore.cameras.set(camera.id, camera);
  dbStore.addAuditLog(req.user!.id, 'CCTV_REGISTERED', 'authorized_cameras', camera.id);

  return res.status(201).json(camera);
});

// POST /cameras/:id/access-request
cctvRouter.post('/:id/access-request', authenticate, requireRole(['RESPONDER', 'ADMIN', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id: cameraId } = req.params;
    const { incident_id, justification } = req.body;

    const request = cctvService.createAccessRequest(
      incident_id,
      cameraId,
      req.user!.id,
      justification || 'Emergency situational assessment by verified responder'
    );

    return res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// GET /incidents/:id/camera-requests
cctvRouter.get('/incidents/:id/camera-requests', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const requests = cctvService.getRequestsForIncident(id);
  return res.json(requests);
});
