# SafeWalk AI — System Architecture & Engineering Blueprint

## 1. High-Level Architecture Overview
SafeWalk AI is architected as a mission-critical, low-latency personal safety and emergency response ecosystem.

```
                           +----------------------------------------+
                           |   SafeWalk Clients (Web & Mobile)      |
                           +----------------------------------------+
                                        |              |
                      HTTPS REST / JSON |              | Direct WebRTC / Sensors
                                        v              v
                           +----------------------------------------+
                           |  SafeWalk Core Server (/api/v1)        |
                           |  - Express.js + TypeScript + Zod       |
                           |  - Role-Based Security (User/Resp/Admin)|
                           +----------------------------------------+
                               /            |           \
                              /             |            \
                             v              v             v
             +--------------------+ +---------------+ +------------------------+
             | Supabase PostgreSQL| | OpenAI Engine | | External Safety Services|
             | - RLS Policies     | | - Whisper-1   | | - 112 India ERSS CAD   |
             | - PostGIS / Indexes| | - GPT-4o-mini | | - Municipal CCTV Grid  |
             | - Encrypted Storage| | - Zod Schemas | | - SMS/Email Gateway    |
             +--------------------+ +---------------+ +------------------------+
```

---

## 2. Core Operational Pillars
1. **Zero-Latency SOS Triggering**: Deterministic activation fallback. The system never blocks distress alerts waiting on remote LLMs or external network dependencies.
2. **Standardized 112 India ERSS Gateway**: Standardized payload transmission incorporating incident ID, caller verified credentials, latitude/longitude, altitude, and evidence pointers.
3. **Cryptographic Digital Evidence Custody**: Captured audio ambient buffers and video streams are hashed with SHA-256 and stored in private buckets with short-lived signed URLs.
4. **Statutory DPDP Compliance**: Adherence to the Digital Personal Data Protection Act with fine-grained user consents, 30-day auto-purge retention policies, and user account deletion rights.
