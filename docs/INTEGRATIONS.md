# SafeWalk AI — Emergency Integrations & Partnerships

## 1. 112 India ERSS (Emergency Response Support System)
The National Emergency Response Support System (ERSS) provides single-number emergency assistance across India.

### Standardized Payload Schema
```json
{
  "incident_id": "e0000000-0000-0000-0000-000000000001",
  "source": "SAFEWALK_AI_CLIENT",
  "timestamp": "2026-10-30T16:30:00Z",
  "caller": {
    "full_name": "Priya Sharma",
    "phone_number": "+919876543210"
  },
  "classification": {
    "category": "stalking",
    "severity": "critical"
  },
  "location": {
    "latitude": 28.6318,
    "longitude": 77.2170,
    "accuracy_meters": 4.2
  },
  "evidence_attached": true
}
```

## 2. Municipal CCTV Camera Surveillance Corridors
SafeWalk AI provides an authorized CCTV integration layer connecting to smart city surveillance grids. Responders can query cameras within radius of an active incident and file audited footage access requests.
