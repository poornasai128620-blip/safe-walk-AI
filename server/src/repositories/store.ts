import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  UserRole,
  RoleType,
  TrustedContact,
  UserConsent,
  UserSafetySettings,
  EmergencyIncident,
  IncidentLocation,
  EmergencyEvidence,
  IncidentNotification,
  EmergencyServiceIntegration,
  IncidentDispatch,
  AuthorizedCamera,
  CameraAccessRequest,
  IncidentTimelineItem,
  AuditLog
} from '@safewalk/shared-types';

export interface StoredUser {
  profile: UserProfile;
  passwordHash: string; // Plaintext or simulated hash for testing
  safetySettings: UserSafetySettings;
  contacts: TrustedContact[];
  consents: UserConsent[];
}

class SafeWalkStore {
  public users = new Map<string, StoredUser>();
  public incidents = new Map<string, EmergencyIncident>();
  public locations = new Map<string, IncidentLocation[]>(); // incidentId -> locations
  public evidence = new Map<string, EmergencyEvidence[]>(); // incidentId -> evidence
  public notifications = new Map<string, IncidentNotification[]>(); // incidentId -> notifications
  public integrations = new Map<string, EmergencyServiceIntegration>();
  public dispatches = new Map<string, IncidentDispatch>(); // id -> dispatch
  public cameras = new Map<string, AuthorizedCamera>();
  public cameraRequests = new Map<string, CameraAccessRequest>();
  public timeline = new Map<string, IncidentTimelineItem[]>(); // incidentId -> timeline
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Standard User
    const standardUserId = 'a1111111-1111-1111-1111-111111111111';
    this.users.set(standardUserId, {
      profile: {
        id: standardUserId,
        full_name: 'Priya Sharma',
        phone_number: '+919876543210',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        preferred_language: 'en',
        role: 'USER',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      passwordHash: 'password123',
      safetySettings: {
        id: uuidv4(),
        user_id: standardUserId,
        voice_detection_enabled: true,
        emergency_audio_enabled: true,
        emergency_video_enabled: true,
        location_sharing_enabled: true,
        emergency_phrase_config: {
          primary_phrase: 'SafeWalk Emergency Help',
          secondary_phrases: ['Bachao', 'Help Me Now', 'Emergency Alert'],
          sensitivity: 'medium',
          language: 'en'
        },
        updated_at: new Date().toISOString()
      },
      contacts: [
        {
          id: 'c1111111-1111-1111-1111-111111111111',
          user_id: standardUserId,
          contact_name: 'Rohit Sharma',
          relationship: 'Brother',
          phone_number: '+919812345678',
          email: 'rohit.sharma@example.com',
          notification_preferences: { sms: true, email: true, push: true },
          verified_at: new Date(Date.now() - 25 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 25 * 86400000).toISOString()
        },
        {
          id: 'c2222222-2222-2222-2222-222222222222',
          user_id: standardUserId,
          contact_name: 'Ananya Deshmukh',
          relationship: 'Friend / Roommate',
          phone_number: '+919898765432',
          email: 'ananya.d@example.com',
          notification_preferences: { sms: true, email: true, push: true },
          verified_at: new Date(Date.now() - 20 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 20 * 86400000).toISOString()
        }
      ],
      consents: [
        {
          id: uuidv4(),
          user_id: standardUserId,
          consent_type: 'location_tracking',
          granted: true,
          consent_version: '1.0',
          granted_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: standardUserId,
          consent_type: 'microphone_emergency',
          granted: true,
          consent_version: '1.0',
          granted_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          user_id: standardUserId,
          consent_type: 'police_dispatch_112',
          granted: true,
          consent_version: '1.0',
          granted_at: new Date().toISOString()
        }
      ]
    });

    // 2. Emergency Responder User
    const responderUserId = 'b2222222-2222-2222-2222-222222222222';
    this.users.set(responderUserId, {
      profile: {
        id: responderUserId,
        full_name: 'Inspector Vikram Singh',
        phone_number: '+919988776655',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        preferred_language: 'en',
        role: 'RESPONDER',
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      passwordHash: 'password123',
      safetySettings: {
        id: uuidv4(),
        user_id: responderUserId,
        voice_detection_enabled: false,
        emergency_audio_enabled: false,
        emergency_video_enabled: false,
        location_sharing_enabled: false,
        emergency_phrase_config: {
          primary_phrase: 'SafeWalk Emergency Help',
          secondary_phrases: [],
          sensitivity: 'medium',
          language: 'en'
        },
        updated_at: new Date().toISOString()
      },
      contacts: [],
      consents: []
    });

    // 3. System Administrator User
    const adminUserId = 'c3333333-3333-3333-3333-333333333333';
    this.users.set(adminUserId, {
      profile: {
        id: adminUserId,
        full_name: 'Dr. Aarav Patel (System Security Officer)',
        phone_number: '+919123456789',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
        preferred_language: 'en',
        role: 'ADMIN',
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      passwordHash: 'password123',
      safetySettings: {
        id: uuidv4(),
        user_id: adminUserId,
        voice_detection_enabled: false,
        emergency_audio_enabled: false,
        emergency_video_enabled: false,
        location_sharing_enabled: false,
        emergency_phrase_config: {
          primary_phrase: 'SafeWalk Emergency Help',
          secondary_phrases: [],
          sensitivity: 'medium',
          language: 'en'
        },
        updated_at: new Date().toISOString()
      },
      contacts: [],
      consents: []
    });

    // 4. Seed Integrations (112 India ERSS)
    const erssId = '11200000-0000-0000-0000-000000000112';
    this.integrations.set(erssId, {
      id: erssId,
      provider_name: 'National Emergency Response Support System (112 India ERSS)',
      provider_type: 'integrated_112',
      configuration: {
        endpoint: 'https://erss.gov.in/api/v2/dispatch',
        state_cad_code: 'MH-MUMBAI-01',
        heartbeat_interval_sec: 30
      },
      enabled: true,
      authorization_status: 'authorized',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 5. Seed Authorized CCTV Nodes
    const sampleCameras: AuthorizedCamera[] = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        camera_name: 'Connaught Place Inner Circle - Sector 4 Pole 12',
        provider_name: 'Municipal Smart City Safe Corridor',
        external_camera_id: 'DEL-CP-CAM-412',
        latitude: 28.6315,
        longitude: 77.2167,
        coverage_radius_meters: 350,
        authorization_status: 'authorized',
        integration_status: 'online',
        created_at: new Date().toISOString()
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        camera_name: 'Bandra Kurla Complex (BKC) Ave 3 Junction',
        provider_name: 'Mumbai City Traffic & Security Police',
        external_camera_id: 'MUM-BKC-J3-08',
        latitude: 19.0657,
        longitude: 72.8687,
        coverage_radius_meters: 500,
        authorization_status: 'authorized',
        integration_status: 'online',
        created_at: new Date().toISOString()
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        camera_name: 'MG Road Metro Station Entry Gate 2',
        provider_name: 'Urban Transit Security Authority',
        external_camera_id: 'BLR-MGR-METRO-02',
        latitude: 12.9756,
        longitude: 77.6066,
        coverage_radius_meters: 300,
        authorization_status: 'authorized',
        integration_status: 'online',
        created_at: new Date().toISOString()
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        camera_name: 'Cyber Hub Footbridge Pedestrian Walkway',
        provider_name: 'Smart Surveillance Grid',
        external_camera_id: 'GGN-CYBERHUB-PB-01',
        latitude: 28.4952,
        longitude: 77.0888,
        coverage_radius_meters: 450,
        authorization_status: 'authorized',
        integration_status: 'online',
        created_at: new Date().toISOString()
      }
    ];

    sampleCameras.forEach(cam => this.cameras.set(cam.id, cam));

    // 6. Seed Active Demo Emergency Incident for verification & testing
    const demoIncidentId = 'e0000000-0000-0000-0000-000000000001';
    const incidentStartTime = new Date(Date.now() - 12 * 60000).toISOString();
    
    this.incidents.set(demoIncidentId, {
      id: demoIncidentId,
      user_id: standardUserId,
      incident_category: 'stalking',
      activation_method: 'manual_sos',
      severity: 'critical',
      status: 'active',
      description: 'Suspicious vehicle following along dimly lit pedestrian pathway near transit terminal.',
      started_at: incidentStartTime,
      created_at: incidentStartTime,
      updated_at: new Date().toISOString()
    });

    // Locations for demo incident
    this.locations.set(demoIncidentId, [
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        latitude: 28.6318,
        longitude: 77.2170,
        accuracy_meters: 4.2,
        altitude_meters: 215,
        recorded_at: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        latitude: 28.6322,
        longitude: 77.2175,
        accuracy_meters: 3.8,
        altitude_meters: 215,
        recorded_at: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        latitude: 28.6327,
        longitude: 77.2181,
        accuracy_meters: 3.1,
        altitude_meters: 216,
        recorded_at: new Date().toISOString()
      }
    ]);

    // Timeline for demo incident
    this.timeline.set(demoIncidentId, [
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        event_type: 'sos_triggered',
        event_description: 'Manual SOS triggered via SafeWalk mobile app button with GPS coordinates',
        event_metadata: { method: 'manual_sos', battery: '84%' },
        created_at: incidentStartTime
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        event_type: 'contact_notified',
        event_description: 'Emergency SMS and live tracking link dispatched to Rohit Sharma (+919812345678)',
        event_metadata: { delivery_status: 'delivered' },
        created_at: new Date(Date.now() - 11 * 60000).toISOString()
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        event_type: '112_dispatch_submitted',
        event_description: 'Standardized emergency incident package transmitted to 112 ERSS Mumbai CAD',
        event_metadata: { external_ref: 'ERSS-112-DL-2026-0924' },
        created_at: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        event_type: 'audio_captured',
        event_description: 'Foreground ambient audio buffer (15s) captured and secured with SHA-256 hash',
        event_metadata: { file_size_bytes: 342100, mime_type: 'audio/mp4' },
        created_at: new Date(Date.now() - 8 * 60000).toISOString()
      }
    ]);

    // Evidence for demo incident
    this.evidence.set(demoIncidentId, [
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        user_id: standardUserId,
        evidence_type: 'audio',
        storage_path: `incidents/${demoIncidentId}/audio_ambient_sample.mp3`,
        mime_type: 'audio/mp3',
        file_size_bytes: 342100,
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        captured_at: new Date(Date.now() - 8 * 60000).toISOString(),
        upload_status: 'completed',
        retention_until: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 8 * 60000).toISOString(),
        download_url: 'https://actions.google.com/sounds/v1/ambiences/street_ambience.ogg' // Standard public sample audio for testing
      }
    ]);

    // Notifications for demo incident
    this.notifications.set(demoIncidentId, [
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        recipient_type: 'trusted_contact',
        recipient_reference: '+919812345678 (Rohit Sharma)',
        provider: 'twilio',
        delivery_status: 'delivered',
        provider_message_id: 'SM9812491823901',
        attempted_at: new Date(Date.now() - 11 * 60000).toISOString(),
        delivered_at: new Date(Date.now() - 11 * 60000 + 1200).toISOString()
      },
      {
        id: uuidv4(),
        incident_id: demoIncidentId,
        recipient_type: 'trusted_contact',
        recipient_reference: '+919898765432 (Ananya Deshmukh)',
        provider: 'twilio',
        delivery_status: 'delivered',
        provider_message_id: 'SM9812491823902',
        attempted_at: new Date(Date.now() - 11 * 60000).toISOString(),
        delivered_at: new Date(Date.now() - 11 * 60000 + 1500).toISOString()
      }
    ]);

    // Initial audit log
    this.addAuditLog(standardUserId, 'USER_LOGIN', 'profiles', standardUserId, { ip: '127.0.0.1' });
    this.addAuditLog(standardUserId, 'SOS_ACTIVATION', 'emergency_incidents', demoIncidentId, {
      method: 'manual_sos',
      category: 'stalking'
    });
  }

  public addAuditLog(actorId: string, action: string, resourceType: string, resourceId?: string, metadata?: Record<string, unknown>) {
    const log: AuditLog = {
      id: uuidv4(),
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      metadata: metadata || null,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    // Keep max 1000 logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }
    return log;
  }
}

export const dbStore = new SafeWalkStore();
