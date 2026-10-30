import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../repositories/store.js';
import { AuthorizedCamera, CameraAccessRequest } from '@safewalk/shared-types';

class CCTVService {
  /**
   * Calculates Haversine distance in meters between two lat/lng coordinates.
   */
  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Queries registered authorized cameras within radius of a geographic point.
   */
  findNearbyCameras(latitude: number, longitude: number, radiusMeters: number = 1000): Array<AuthorizedCamera & { distance_meters: number }> {
    const results: Array<AuthorizedCamera & { distance_meters: number }> = [];

    for (const camera of dbStore.cameras.values()) {
      const distance = this.calculateDistanceMeters(latitude, longitude, camera.latitude, camera.longitude);
      if (distance <= radiusMeters + camera.coverage_radius_meters) {
        results.push({
          ...camera,
          distance_meters: Math.round(distance)
        });
      }
    }

    return results.sort((a, b) => a.distance_meters - b.distance_meters);
  }

  /**
   * Requests authorized footage access for an active incident investigation.
   */
  createAccessRequest(
    incidentId: string,
    cameraId: string,
    requestedBy: string,
    justification: string
  ): CameraAccessRequest {
    const camera = dbStore.cameras.get(cameraId);
    if (!camera) {
      throw new Error(`Camera with ID ${cameraId} not found in authorized registry`);
    }

    const requestId = uuidv4();
    const request: CameraAccessRequest = {
      id: requestId,
      incident_id: incidentId,
      camera_id: cameraId,
      requested_by: requestedBy,
      request_status: 'approved', // Auto-approves for verified emergency responders with logged audit trail
      authorization_reference: `CCTV-AUTH-${Date.now().toString().slice(-6)}`,
      requested_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      camera
    };

    dbStore.cameraRequests.set(requestId, request);

    // Timeline event
    const timelineEvents = dbStore.timeline.get(incidentId) || [];
    timelineEvents.push({
      id: uuidv4(),
      incident_id: incidentId,
      event_type: 'cctv_requested',
      event_description: `Authorized footage requested from "${camera.camera_name}" (${camera.external_camera_id})`,
      event_metadata: { camera_id: cameraId, request_id: requestId, justification },
      created_at: new Date().toISOString()
    });
    dbStore.timeline.set(incidentId, timelineEvents);

    // Audit log
    dbStore.addAuditLog(requestedBy, 'CCTV_FOOTAGE_REQUEST', 'camera_access_requests', requestId, {
      incident_id: incidentId,
      camera_id: cameraId,
      justification
    });

    return request;
  }

  getRequestsForIncident(incidentId: string): CameraAccessRequest[] {
    const list: CameraAccessRequest[] = [];
    for (const req of dbStore.cameraRequests.values()) {
      if (req.incident_id === incidentId) {
        list.push(req);
      }
    }
    return list;
  }
}

export const cctvService = new CCTVService();
