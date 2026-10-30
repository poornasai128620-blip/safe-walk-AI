// ==============================================================================
// SafeWalk AI — Zod Schemas for Runtime Validation
// ==============================================================================

import { z } from 'zod';

// -----------------------------------------------------------------------------
// Authentication & User Profiles
// -----------------------------------------------------------------------------

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirm_password: z.string().min(8, 'Confirm password must match'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone_number: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Please enter a valid international or national phone number'),
  role: z.enum(['USER', 'RESPONDER']).default('USER'),
  terms_accepted: z.boolean().refine(v => v === true, 'You must accept terms and conditions'),
  privacy_consent: z.boolean().refine(v => v === true, 'You must consent to privacy policy')
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
});

export const LoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required')
});

export const UserProfileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{7,14}$/).optional(),
  avatar_url: z.string().url().nullable().optional(),
  preferred_language: z.string().min(2).max(10).default('en')
});

// -----------------------------------------------------------------------------
// Trusted Contacts
// -----------------------------------------------------------------------------

export const TrustedContactSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required').max(100),
  relationship: z.string().max(50).optional().nullable(),
  phone_number: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Valid phone number required'),
  email: z.string().email('Valid email address required').optional().nullable(),
  notification_preferences: z.object({
    sms: z.boolean().default(true),
    email: z.boolean().default(true),
    push: z.boolean().default(true)
  }).default({ sms: true, email: true, push: true })
});

// -----------------------------------------------------------------------------
// Safety Settings & Consents
// -----------------------------------------------------------------------------

export const ConsentUpdateSchema = z.object({
  consent_type: z.enum([
    'location_tracking',
    'microphone_emergency',
    'camera_emergency',
    'trusted_contacts_alert',
    'police_dispatch_112',
    'ai_audio_processing'
  ]),
  granted: z.boolean(),
  consent_version: z.string().default('1.0')
});

export const EmergencyPhraseConfigSchema = z.object({
  primary_phrase: z.string().min(2, 'Emergency trigger phrase cannot be empty'),
  secondary_phrases: z.array(z.string()).default([]),
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
  language: z.string().default('en')
});

export const SafetySettingsUpdateSchema = z.object({
  voice_detection_enabled: z.boolean().optional(),
  emergency_audio_enabled: z.boolean().optional(),
  emergency_video_enabled: z.boolean().optional(),
  location_sharing_enabled: z.boolean().optional(),
  emergency_phrase_config: EmergencyPhraseConfigSchema.optional()
});

// -----------------------------------------------------------------------------
// Emergency Incidents & GPS
// -----------------------------------------------------------------------------

export const IncidentCategoryEnum = z.enum([
  'personal_safety',
  'harassment',
  'stalking',
  'threats',
  'medical_emergency',
  'accident',
  'travel_emergency',
  'child_safety',
  'elderly_assistance',
  'other_emergency'
]);

export const IncidentSeverityEnum = z.enum(['critical', 'high', 'medium', 'low', 'unclassified']);
export const IncidentStatusEnum = z.enum(['active', 'cancelled', 'resolved', 'escalated']);
export const ActivationMethodEnum = z.enum([
  'manual_sos',
  'voice_activation',
  'safety_timer_timeout',
  'fall_detection',
  'test_mode'
]);

export const CreateIncidentSchema = z.object({
  idempotency_key: z.string().uuid().optional(),
  incident_category: IncidentCategoryEnum.default('personal_safety'),
  activation_method: ActivationMethodEnum.default('manual_sos'),
  severity: IncidentSeverityEnum.default('critical'),
  description: z.string().max(1000).optional().nullable(),
  initial_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy_meters: z.number().positive().optional().nullable(),
    altitude_meters: z.number().optional().nullable()
  }).optional()
});

export const IncidentStatusUpdateSchema = z.object({
  status: IncidentStatusEnum,
  reason: z.string().max(500).optional()
});

export const RecordLocationSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180),
  accuracy_meters: z.number().positive().optional().nullable(),
  altitude_meters: z.number().optional().nullable(),
  recorded_at: z.string().datetime().optional()
});

// -----------------------------------------------------------------------------
// Evidence Custody
// -----------------------------------------------------------------------------

export const RequestEvidenceUploadUrlSchema = z.object({
  evidence_type: z.enum(['audio', 'video', 'photo', 'sensor_log']),
  mime_type: z.string().regex(/^(audio\/.+|video\/.+|image\/.+|application\/json)$/, 'Invalid MIME type for evidence'),
  file_size_bytes: z.number().positive().max(52428800, 'Maximum file size is 50MB')
});

export const CompleteEvidenceUploadSchema = z.object({
  storage_path: z.string().min(5),
  evidence_type: z.enum(['audio', 'video', 'photo', 'sensor_log']),
  mime_type: z.string(),
  file_size_bytes: z.number().positive(),
  checksum: z.string().optional().nullable()
});

// -----------------------------------------------------------------------------
// Dispatch & CCTV
// -----------------------------------------------------------------------------

export const Dispatch112RequestSchema = z.object({
  integration_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional()
});

export const NearbyCameraQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().positive().max(10000).default(1000)
});

export const CameraAccessRequestSchema = z.object({
  camera_id: z.string().uuid(),
  incident_id: z.string().uuid(),
  justification: z.string().min(5, 'Legal or operational justification required')
});

// -----------------------------------------------------------------------------
// AI Output Validation Schemas (Strict Output Guarantee)
// -----------------------------------------------------------------------------

export const AISpeechAnalysisOutputSchema = z.object({
  emergency_phrase_detected: z.boolean(),
  matched_phrase: z.string().nullable(),
  language: z.string(),
  confidence: z.number().min(0).max(1),
  recommended_action: z.enum(['request_user_confirmation', 'trigger_immediate_sos', 'none']),
  reason: z.string()
});

export const AIIncidentClassificationOutputSchema = z.object({
  category: IncidentCategoryEnum,
  suggested_severity: IncidentSeverityEnum,
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  uncertainties: z.array(z.string()),
  human_review_required: z.boolean()
});

export const AIIncidentSummaryOutputSchema = z.object({
  incident_id: z.string(),
  summary: z.string(),
  activation_method: ActivationMethodEnum,
  available_location: z.boolean(),
  evidence_available: z.boolean(),
  missing_information: z.array(z.string()),
  human_review_required: z.boolean()
});

export const AITimelineSummaryOutputSchema = z.object({
  incident_id: z.string(),
  timeline_summary: z.string(),
  important_events: z.array(z.string()),
  location_updates_available: z.boolean(),
  evidence_references: z.array(z.string()),
  uncertainties: z.array(z.string())
});
