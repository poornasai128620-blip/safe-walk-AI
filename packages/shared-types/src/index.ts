// ==============================================================================
// SafeWalk AI — Shared Domain Interfaces & Types
// ==============================================================================

export type RoleType = 'USER' | 'RESPONDER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string; // UUID references auth.users(id)
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  preferred_language: string;
  role: RoleType;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleType;
  granted_by?: string | null;
  created_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  contact_name: string;
  relationship?: string | null;
  phone_number: string;
  email?: string | null;
  notification_preferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  verified_at?: string | null;
  created_at: string;
}

export type ConsentType = 
  | 'location_tracking' 
  | 'microphone_emergency' 
  | 'camera_emergency' 
  | 'trusted_contacts_alert' 
  | 'police_dispatch_112' 
  | 'ai_audio_processing';

export interface UserConsent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  consent_version: string;
  granted_at: string;
  revoked_at?: string | null;
}

export interface EmergencyPhraseConfig {
  primary_phrase: string;
  secondary_phrases: string[];
  sensitivity: 'low' | 'medium' | 'high';
  language: string;
}

export interface UserSafetySettings {
  id: string;
  user_id: string;
  voice_detection_enabled: boolean;
  emergency_audio_enabled: boolean;
  emergency_video_enabled: boolean;
  location_sharing_enabled: boolean;
  emergency_phrase_config: EmergencyPhraseConfig;
  updated_at: string;
}

export type IncidentCategory =
  | 'personal_safety'
  | 'harassment'
  | 'stalking'
  | 'threats'
  | 'medical_emergency'
  | 'accident'
  | 'travel_emergency'
  | 'child_safety'
  | 'elderly_assistance'
  | 'other_emergency';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unclassified';

export type IncidentStatus = 'active' | 'cancelled' | 'resolved' | 'escalated';

export type ActivationMethod =
  | 'manual_sos'
  | 'voice_activation'
  | 'safety_timer_timeout'
  | 'fall_detection'
  | 'test_mode';

export interface EmergencyIncident {
  id: string;
  user_id: string;
  incident_category: IncidentCategory;
  activation_method: ActivationMethod;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description?: string | null;
  started_at: string;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined or calculated fields for rich views
  user_profile?: UserProfile;
  latest_location?: IncidentLocation;
  timeline?: IncidentTimelineItem[];
  evidence_count?: number;
}

export interface IncidentLocation {
  id: string;
  incident_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number | null;
  altitude_meters?: number | null;
  recorded_at: string;
}

export type EvidenceType = 'audio' | 'video' | 'photo' | 'sensor_log';
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface EmergencyEvidence {
  id: string;
  incident_id: string;
  user_id: string;
  evidence_type: EvidenceType;
  storage_path: string;
  mime_type: string;
  file_size_bytes?: number | null;
  checksum?: string | null;
  captured_at: string;
  upload_status: UploadStatus;
  retention_until?: string | null;
  created_at: string;
  download_url?: string | null; // Signed temporary URL
}

export type NotificationProvider = 'firebase' | 'twilio' | 'sendgrid' | 'mock';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export interface IncidentNotification {
  id: string;
  incident_id: string;
  recipient_type: 'trusted_contact' | 'emergency_services' | 'system_alert';
  recipient_reference: string;
  provider: NotificationProvider;
  delivery_status: DeliveryStatus;
  provider_message_id?: string | null;
  attempted_at: string;
  delivered_at?: string | null;
  error_code?: string | null;
}

export interface EmergencyServiceIntegration {
  id: string;
  provider_name: string; // e.g. "112 India ERSS (Emergency Response Support System)"
  provider_type: 'police' | 'medical' | 'fire' | 'integrated_112';
  configuration?: Record<string, unknown>;
  enabled: boolean;
  authorization_status: 'authorized' | 'pending_verification' | 'disabled';
  created_at: string;
  updated_at: string;
}

export type DispatchStatus = 'created' | 'submitted' | 'acknowledged' | 'confirmed' | 'failed';

export interface IncidentDispatch {
  id: string;
  incident_id: string;
  integration_id: string;
  dispatch_status: DispatchStatus;
  external_reference?: string | null; // e.g. "ERSS-112-MH-2026-98124"
  submitted_at?: string | null;
  acknowledged_at?: string | null;
  error_details?: Record<string, unknown> | null;
}

export interface AuthorizedCamera {
  id: string;
  camera_name: string;
  provider_name: string;
  external_camera_id: string;
  latitude: number;
  longitude: number;
  coverage_radius_meters: number;
  authorization_status: 'authorized' | 'restricted' | 'revoked';
  integration_status: 'online' | 'offline' | 'degraded';
  created_at: string;
}

export interface CameraAccessRequest {
  id: string;
  incident_id: string;
  camera_id: string;
  requested_by: string;
  request_status: 'pending' | 'approved' | 'rejected' | 'retrieved';
  authorization_reference?: string | null;
  requested_at: string;
  approved_at?: string | null;
  camera?: AuthorizedCamera;
}

export interface IncidentTimelineItem {
  id: string;
  incident_id: string;
  event_type: 
    | 'sos_triggered' 
    | 'location_updated' 
    | 'audio_captured' 
    | 'video_captured' 
    | 'contact_notified' 
    | '112_dispatch_submitted' 
    | '112_dispatch_acknowledged' 
    | 'cctv_requested' 
    | 'ai_analysis_performed' 
    | 'responder_assigned' 
    | 'cancelled' 
    | 'resolved';
  event_description: string;
  event_metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// AI Integration Output Schemas
// -----------------------------------------------------------------------------

export interface EmergencySpeechAnalysisResult {
  emergency_phrase_detected: boolean;
  matched_phrase: string | null;
  language: string;
  confidence: number;
  recommended_action: 'request_user_confirmation' | 'trigger_immediate_sos' | 'none';
  reason: string;
}

export interface IncidentClassificationResult {
  category: IncidentCategory;
  suggested_severity: IncidentSeverity;
  summary: string;
  confidence: number;
  uncertainties: string[];
  human_review_required: boolean;
}

export interface IncidentSummaryResult {
  incident_id: string;
  summary: string;
  activation_method: ActivationMethod;
  available_location: boolean;
  evidence_available: boolean;
  missing_information: string[];
  human_review_required: boolean;
}

export interface SpeechTranscriptionResult {
  transcript: string;
  language: string;
  confidence: number;
  processing_status: 'completed' | 'failed' | 'fallback';
}

export interface EmergencyTimelineSummaryResult {
  incident_id: string;
  timeline_summary: string;
  important_events: string[];
  location_updates_available: boolean;
  evidence_references: string[];
  uncertainties: string[];
}
