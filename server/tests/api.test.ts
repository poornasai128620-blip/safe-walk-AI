import { describe, it, expect } from 'vitest';
import { dbStore } from '../src/repositories/store.js';
import { aiService } from '../src/services/aiService.js';
import { emergencyService } from '../src/services/emergencyService.js';
import { cctvService } from '../src/services/cctvService.js';
import { notificationService } from '../src/services/notificationService.js';
import {
  RegisterSchema,
  CreateIncidentSchema,
  RecordLocationSchema,
  NearbyCameraQuerySchema
} from '@safewalk/validation';

describe('SafeWalk AI Core Platform Test Suite', () => {
  // 1. Zod Validation & Schema Guardrails
  describe('Zod Validation Schemas', () => {
    it('validates a valid registration payload', () => {
      const payload = {
        email: 'test@safewalk.ai',
        password: 'Password123!',
        confirm_password: 'Password123!',
        full_name: 'Ananya Deshmukh',
        phone_number: '+919876543210',
        role: 'USER',
        terms_accepted: true,
        privacy_consent: true
      };
      const result = RegisterSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects coordinates out of bounds', () => {
      const invalidCoords = {
        latitude: 95.0, // Invalid: > 90
        longitude: 77.2167
      };
      const result = RecordLocationSchema.safeParse(invalidCoords);
      expect(result.success).toBe(false);
    });

    it('validates emergency incident trigger payload', () => {
      const incidentPayload = {
        incident_category: 'personal_safety',
        activation_method: 'manual_sos',
        severity: 'critical',
        initial_location: {
          latitude: 28.6315,
          longitude: 77.2167,
          accuracy_meters: 5.0
        }
      };
      const result = CreateIncidentSchema.safeParse(incidentPayload);
      expect(result.success).toBe(true);
    });
  });

  // 2. AI Voice Emergency & Incident Analysis
  describe('AI Emergency Analysis & Deterministic Fallback', () => {
    it('accurately identifies configured emergency phrases with high confidence', async () => {
      const result = await aiService.analyzeSpeechForEmergency(
        'Please someone help me, SafeWalk Emergency Help quickly',
        ['SafeWalk Emergency Help', 'Bachao'],
        'en'
      );
      expect(result.emergency_phrase_detected).toBe(true);
      expect(result.matched_phrase).toBe('SafeWalk Emergency Help');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
      expect(result.recommended_action).toBe('request_user_confirmation');
    });

    it('accurately detects multilingual emergency cry like "Bachao"', async () => {
      const result = await aiService.analyzeSpeechForEmergency(
        'Koi to bachao mujhe emergency hai',
        ['SafeWalk Emergency Help', 'Bachao'],
        'hi'
      );
      expect(result.emergency_phrase_detected).toBe(true);
      expect(result.matched_phrase).toBe('Bachao');
    });

    it('classifies stalking/threat incident and flags human review requirement', async () => {
      const classification = await aiService.classifyIncident(
        'A stranger has been following me closely for three blocks in a dark alley'
      );
      expect(classification.category).toBe('stalking');
      expect(classification.suggested_severity).toBe('critical');
      expect(classification.human_review_required).toBe(true);
    });
  });

  // 3. National 112 ERSS Integration
  describe('National 112 ERSS Dispatch Gateway', () => {
    it('creates standardized 112 dispatch payload with CAD reference', async () => {
      const demoUser = dbStore.users.get('a1111111-1111-1111-1111-111111111111')!.profile;
      const demoIncident = dbStore.incidents.get('e0000000-0000-0000-0000-000000000001')!;
      const demoLocation = dbStore.locations.get('e0000000-0000-0000-0000-000000000001')![0];

      const dispatch = await emergencyService.dispatchIncident(
        demoIncident,
        demoUser,
        demoLocation,
        true
      );

      expect(dispatch).toBeDefined();
      expect(dispatch.dispatch_status).toBe('submitted');
      expect(dispatch.external_reference).toContain('ERSS-112');
      expect(dispatch.incident_id).toBe(demoIncident.id);
    });
  });

  // 4. Authorized CCTV Proximity Search (Haversine Formula)
  describe('Authorized CCTV Registry & Geographic Lookup', () => {
    it('finds cameras within 1000m radius of Connaught Place coordinates', () => {
      // Connaught Place: 28.6315, 77.2167
      const nearby = cctvService.findNearbyCameras(28.6315, 77.2167, 1000);
      expect(nearby.length).toBeGreaterThan(0);
      expect(nearby[0].camera_name).toContain('Connaught Place');
      expect(nearby[0].distance_meters).toBeLessThan(100);
    });

    it('creates authorized footage access request with audit reference', () => {
      const req = cctvService.createAccessRequest(
        'e0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'b2222222-2222-2222-2222-222222222222', // Responder
        'Immediate threat assessment for active stalking incident'
      );

      expect(req.request_status).toBe('approved');
      expect(req.authorization_reference).toContain('CCTV-AUTH');
    });
  });

  // 5. Emergency Incident Lifecycle & Timeline Logging
  describe('Incident Lifecycle & Audit Trails', () => {
    it('logs immutable timeline events and audit log entries', () => {
      const initialLogsCount = dbStore.auditLogs.length;
      dbStore.addAuditLog('a1111111-1111-1111-1111-111111111111', 'MANUAL_SOS_TRIGGERED', 'emergency_incidents', 'test-inc-1');
      expect(dbStore.auditLogs.length).toBe(initialLogsCount + 1);
      expect(dbStore.auditLogs[0].action).toBe('MANUAL_SOS_TRIGGERED');
    });
  });
});
