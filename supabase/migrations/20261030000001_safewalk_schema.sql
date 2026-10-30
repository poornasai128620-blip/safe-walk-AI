-- ==============================================================================
-- SAFEWALK AI — Production PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- References auth.users(id)
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'RESPONDER', 'ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('USER', 'RESPONDER', 'ADMIN', 'SUPER_ADMIN')),
  granted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ------------------------------------------------------------------------------
-- 2. TRUSTED CONTACTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  notification_preferences JSONB NOT NULL DEFAULT '{"sms": true, "email": true, "push": true}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. USER CONSENTS & PERMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'location_tracking', 'microphone_emergency', 'camera_emergency', 
    'trusted_contacts_alert', 'police_dispatch_112', 'ai_audio_processing'
  )),
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, consent_type)
);

-- ------------------------------------------------------------------------------
-- 4. USER SAFETY SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_safety_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  voice_detection_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_video_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_phrase_config JSONB NOT NULL DEFAULT '{
    "primary_phrase": "SafeWalk Emergency Help",
    "secondary_phrases": ["Bachao", "Help Me Now", "Emergency Alert"],
    "sensitivity": "medium",
    "language": "en"
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. EMERGENCY INCIDENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incident_category TEXT NOT NULL CHECK (incident_category IN (
    'personal_safety', 'harassment', 'stalking', 'threats', 
    'medical_emergency', 'accident', 'travel_emergency', 
    'child_safety', 'elderly_assistance', 'other_emergency'
  )),
  activation_method TEXT NOT NULL CHECK (activation_method IN (
    'manual_sos', 'voice_activation', 'safety_timer_timeout', 'fall_detection', 'test_mode'
  )),
  severity TEXT NOT NULL DEFAULT 'critical' CHECK (severity IN (
    'critical', 'high', 'medium', 'low', 'unclassified'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'cancelled', 'resolved', 'escalated'
  )),
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. INCIDENT LOCATIONS (GPS TRACKING)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incident_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  accuracy_meters DOUBLE PRECISION,
  altitude_meters DOUBLE PRECISION,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. EMERGENCY EVIDENCE (AUDIO / VIDEO / SENSOR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('audio', 'video', 'photo', 'sensor_log')),
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  checksum TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  retention_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. INCIDENT NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incident_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('trusted_contact', 'emergency_services', 'system_alert')),
  recipient_reference TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('firebase', 'twilio', 'sendgrid', 'mock')),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
  provider_message_id TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  error_code TEXT
);

-- ------------------------------------------------------------------------------
-- 9. EMERGENCY SERVICE INTEGRATIONS (112 ERSS INDIA ARCHITECTURE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_service_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('police', 'medical', 'fire', 'integrated_112')),
  configuration JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  authorization_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (authorization_status IN ('authorized', 'pending_verification', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incident_dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.emergency_service_integrations(id),
  dispatch_status TEXT NOT NULL DEFAULT 'created' CHECK (dispatch_status IN ('created', 'submitted', 'acknowledged', 'confirmed', 'failed')),
  external_reference TEXT,
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  error_details JSONB
);

-- ------------------------------------------------------------------------------
-- 10. AUTHORIZED CCTV REGISTRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.authorized_cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camera_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  external_camera_id TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  coverage_radius_meters DOUBLE PRECISION NOT NULL DEFAULT 500,
  authorization_status TEXT NOT NULL DEFAULT 'authorized' CHECK (authorization_status IN ('authorized', 'restricted', 'revoked')),
  integration_status TEXT NOT NULL DEFAULT 'online' CHECK (integration_status IN ('online', 'offline', 'degraded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.camera_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  camera_id UUID NOT NULL REFERENCES public.authorized_cameras(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  request_status TEXT NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'rejected', 'retrieved')),
  authorization_reference TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 11. TIMELINE & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incident_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE & FAST GEOGRAPHIC LOOKUPS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.emergency_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_locations_incident_id ON public.incident_locations(incident_id);
CREATE INDEX IF NOT EXISTS idx_evidence_incident_id ON public.emergency_evidence(incident_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_cameras_lat_lon ON public.authorized_cameras(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_timeline_incident_id ON public.incident_timeline(incident_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Helper functions to inspect caller role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_responder_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('RESPONDER', 'ADMIN', 'SUPER_ADMIN')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_safety_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see and update only their own profile; Responders can view profiles associated with incidents
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_responder_or_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Contacts: Users manage their own contacts
CREATE POLICY "Users select own contacts" ON public.trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own contacts" ON public.trusted_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contacts" ON public.trusted_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own contacts" ON public.trusted_contacts FOR DELETE USING (auth.uid() = user_id);

-- Consents & Safety Settings:
CREATE POLICY "Users manage own consents" ON public.user_consents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own safety settings" ON public.user_safety_settings FOR ALL USING (auth.uid() = user_id);

-- Emergency Incidents: Users view/insert their own; Responders/Admins view all incidents
CREATE POLICY "Users and responders view incidents" ON public.emergency_incidents FOR SELECT USING (
  auth.uid() = user_id OR public.is_responder_or_admin()
);
CREATE POLICY "Users create incidents" ON public.emergency_incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and responders update incidents" ON public.emergency_incidents FOR UPDATE USING (
  auth.uid() = user_id OR public.is_responder_or_admin()
);

-- Locations: Users insert for active incidents; Responders/Admins view
CREATE POLICY "View incident locations" ON public.incident_locations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.emergency_incidents i 
    WHERE i.id = incident_locations.incident_id 
    AND (i.user_id = auth.uid() OR public.is_responder_or_admin())
  )
);
CREATE POLICY "Insert incident locations" ON public.incident_locations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.emergency_incidents i 
    WHERE i.id = incident_locations.incident_id AND i.user_id = auth.uid()
  )
);

-- Evidence: Secure access
CREATE POLICY "View emergency evidence" ON public.emergency_evidence FOR SELECT USING (
  auth.uid() = user_id OR public.is_responder_or_admin()
);
CREATE POLICY "Insert emergency evidence" ON public.emergency_evidence FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Cameras: Viewable by responders and admins
CREATE POLICY "View authorized cameras" ON public.authorized_cameras FOR SELECT USING (
  public.is_responder_or_admin()
);

-- Timeline: Viewable by owner and responders
CREATE POLICY "View timeline" ON public.incident_timeline FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.emergency_incidents i 
    WHERE i.id = incident_timeline.incident_id 
    AND (i.user_id = auth.uid() OR public.is_responder_or_admin())
  )
);

-- Audit logs: Read-only for admins
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  public.is_responder_or_admin()
);
