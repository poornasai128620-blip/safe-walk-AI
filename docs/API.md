# SafeWalk AI — API Reference (v1)

Base URL: `/api/v1`

## 1. Authentication (`/api/v1/auth`)
- `POST /register`: Register user account. Validates email, password, phone, role, consents.
- `POST /login`: Authenticate and receive signed JWT.
- `GET /me`: Get current session profile, active role, safety settings, contacts.
- `POST /logout`: Invalidate session and record audit log.

## 2. Emergency Incidents & SOS (`/api/v1/incidents`)
- `POST /`: Immediate emergency activation. Dispatches notifications to trusted contacts and initiates 112 dispatch.
- `GET /`: Retrieve incident list. Users see their own; Responders see all.
- `GET /:id`: Comprehensive incident response telemetry, location trail, evidence, CCTV nearby.
- `PATCH /:id/status`: Transition incident status (`active`, `cancelled`, `resolved`, `escalated`).
- `POST /:id/cancel`: Record cancellation/false alarm reason and update contacts.
- `POST /:id/resolve`: Close incident with resolution notes.

## 3. Real-Time GPS (`/api/v1/incidents/:id/location`)
- `POST /`: Push new GPS coordinate with accuracy in meters and altitude.
- `GET /locations`: Retrieve historical breadcrumb trail.
- `GET /location/latest`: Get latest verified coordinate.

## 4. Evidence Locker (`/api/v1/incidents/:id/evidence`)
- `POST /upload-url`: Generate pre-signed secure upload URL.
- `POST /complete`: Register completed upload with SHA-256 checksum and MIME validation.
- `GET /`: Retrieve evidence items.

## 5. AI Emergency Services (`/api/v1/ai`)
- `POST /detect-voice-emergency`: Compare speech transcript against user phrases with confidence scoring.
- `POST /analyze-incident`: Categorize text and suggest severity with human review required tag.
- `POST /summarize-incident`: Generate neutral factual dispatcher summary.

## 6. Integrations & CCTV (`/api/v1/cameras`, `/api/v1/integrations`)
- `GET /cameras/nearby`: Search registered cameras within geographic radius using Haversine calculation.
- `POST /cameras/:id/access-request`: Request authorized footage access with legal justification.
- `POST /integrations/emergency/:id/dispatch`: Transmit standardized emergency payload to 112 India ERSS CAD.
