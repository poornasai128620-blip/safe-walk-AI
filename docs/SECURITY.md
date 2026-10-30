# SafeWalk AI — Security Protocols & RLS Guarantees

## 1. Zero Trust & Row Level Security (RLS)
Every PostgreSQL table is guarded by RLS policies:
- Standard users are strictly isolated to their own profiles, contacts, and personal incidents.
- Verified responders (`RESPONDER`) and administrators (`ADMIN`) can access incident telemetry for dispatch operations.
- Roles are validated server-side using secure cryptographic tokens; user-supplied roles in request bodies are ignored.

## 2. Evidence Protection & Cryptographic Integrity
- Raw storage buckets are strictly private (`emergency-evidence`).
- Time-limited signed URLs (default 60 minutes) are issued only to authenticated users or assigned responders.
- Every file is fingerprinted using SHA-256 upon upload completion.

## 3. Rate Limiting & Denial of Service Protection
- API rate limiting: 120 req/min for general routes.
- Emergency SOS rate limiting: 30 req/min per IP to prevent automated flood while accommodating distress bursts.
