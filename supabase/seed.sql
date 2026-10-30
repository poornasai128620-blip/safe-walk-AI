-- ==============================================================================
-- SAFEWALK AI — Synthetic Development Seed Data
-- ==============================================================================

-- 1. Emergency Service Integrations (112 India ERSS Architecture)
INSERT INTO public.emergency_service_integrations (
  id, provider_name, provider_type, configuration, enabled, authorization_status
) VALUES 
(
  '11200000-0000-0000-0000-000000000112',
  'National Emergency Response Support System (112 India ERSS)',
  'integrated_112',
  '{"endpoint": "https://erss.gov.in/api/v2/dispatch", "state_cad_code": "MH-MUMBAI-01", "heartbeat_interval_sec": 30}'::jsonb,
  TRUE,
  'authorized'
),
(
  '11200000-0000-0000-0000-000000000108',
  'National Ambulance Service (108 India EMS)',
  'medical',
  '{"endpoint": "https://ems108.gov.in/api/v1/alert"}'::jsonb,
  TRUE,
  'authorized'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Synthetic Authorized CCTV Nodes (Delhi / Mumbai Metro & Transit Test Corridors)
INSERT INTO public.authorized_cameras (
  id, camera_name, provider_name, external_camera_id, latitude, longitude, coverage_radius_meters, authorization_status, integration_status
) VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  'Connaught Place Inner Circle - Sector 4 Pole 12',
  'Municipal Smart City Safe Corridor',
  'DEL-CP-CAM-412',
  28.6315,
  77.2167,
  350,
  'authorized',
  'online'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Bandra Kurla Complex (BKC) Ave 3 Junction',
  'Mumbai City Traffic & Security Police',
  'MUM-BKC-J3-08',
  19.0657,
  72.8687,
  500,
  'authorized',
  'online'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'MG Road Metro Station Entry Gate 2',
  'Urban Transit Security Authority',
  'BLR-MGR-METRO-02',
  12.9756,
  77.6066,
  300,
  'authorized',
  'online'
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Cyber Hub Footbridge Pedestrian Walkway',
  'Smart Surveillance Grid',
  'GGN-CYBERHUB-PB-01',
  28.4952,
  77.0888,
  450,
  'authorized',
  'online'
)
ON CONFLICT (id) DO NOTHING;
