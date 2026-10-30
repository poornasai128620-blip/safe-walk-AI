# SafeWalk AI — Emergency Response & Personal Safety Platform

> **"Your Voice. Your Location. Your Safety."**  
> Production-grade personal safety and emergency response startup platform connecting citizens, trusted emergency circles, municipal CCTV infrastructure, and the National 112 Emergency Response Support System (ERSS).

---

## 🌟 Platform Capabilities

- **One-Touch & Hands-Free Voice SOS**: Instant emergency trigger via prominent glowing button or voice trigger recognition ("SafeWalk Emergency Help", "Bachao"). Includes a 5-second accidental activation cancellation window.
- **Real-Time GPS Telemetry**: High-precision GPS coordinates, accuracy radius (meters), altitude, and historical breadcrumb path.
- **National 112 ERSS Integration**: Standardized emergency incident payload generation, CAD submission tracking, and audit logging.
- **Authorized CCTV Camera Registry**: Haversine distance lookup for certified municipal smart city surveillance cameras within incident radius with legal access request workflows.
- **AI Emergency Information Analysis**: Server-side OpenAI Whisper speech transcription, automated incident classification, and dispatcher structured summaries (clearly labeled with human review required tags).
- **Cryptographic Evidence Custody**: Captured audio buffers and foreground video streams secured with SHA-256 hashes in private storage buckets with temporary signed access URLs.
- **Full Row-Level Security (RLS)**: Complete PostgreSQL data isolation ensuring regular users cannot access other users' private recordings, with role-based access control for responders (`RESPONDER`) and administrators (`ADMIN`).
- **DPDP Act Compliance**: Transparent user consents, 30-day automatic retention purge, and user account deletion.

---

## 🏗️ Repository Architecture

```
c:\safe walk ai\
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS + Lucide + Tactical Maps
│   └── mobile/                 # React Native + Expo SDK + Expo Router
├── server/                     # Node.js + Express + TypeScript + Zod + OpenAI SDK
├── packages/
│   ├── shared-types/           # Canonical TypeScript domain interfaces
│   └── validation/             # Reusable Zod validation schemas
├── supabase/
│   ├── migrations/             # Production PostgreSQL schema, RLS policies, indexes
│   └── seed.sql                # Synthetic development seed data
└── docs/                       # Architecture, API, Security, DPDP Privacy, Integrations
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The server runs out-of-the-box with pre-seeded demo users and mock adapters if external keys are not provided).*

### 3. Run Development Servers
```bash
# Run both backend server and web application:
npm run dev

# Or run separately:
npm run dev:server    # Backend API on http://localhost:3001
npm run dev:web       # Web Dashboard & SOS Checkpoint on http://localhost:5173
npm run dev:mobile    # Expo mobile app
```

### 4. Run Automated Tests
```bash
npm test
```

---

## 🔑 Demo Access Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen User** | `user@safewalk.ai` | `password123` | Personal SOS, Trusted Contacts, Consents |
| **112 Responder** | `responder@safewalk.ai` | `password123` | CAD Command Center, Incident Dispatch, CCTV |
| **System Admin** | `admin@safewalk.ai` | `password123` | Camera Registry, Full Audit Trail, Settings |

*(One-click demo buttons are available on the web sign-in screen and top navbar).*

---

## 🛡️ Statutory Guardrails
SafeWalk AI strictly complies with Section 4 of the Operational Directives:
1. AI suggestions never replace human emergency dispatch authority.
2. The manual SOS button operates reliably offline without external AI dependence.
3. No secret microphone or camera recording is ever executed.
4. Camera footage is only requested through authorized channels with logged justifications.
