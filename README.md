# AmyLearn

[![Deployed with Vercel](https://vercel.com/button)](https://amylearn.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Deployment-black?style=flat&logo=vercel)](https://amylearn.vercel.app)

> 🚀 **Live Production Deployment:** [https://amylearn.vercel.app](https://amylearn.vercel.app)  
> 🔗 **Alternative Mirror:** [https://amylearn-iamsoura005s-projects.vercel.app](https://amylearn-iamsoura005s-projects.vercel.app)

**Unified academic platform for modern education.** One multi-tenant workspace for departments, examinations, attendance, learning, library circulation and AI study support — each campus isolated behind its own college code.

## Repository layout

| Path | Purpose |
| --- | --- |
| `frontend/` | React 18 + Vite SPA — landing, campus portals and platform console |
| `backend/` | Express + Prisma API — tenant-scoped controllers, crons, seed |
| `webdata/` | Static web assets (college logos, demo imagery) |

## Tech stack

- **Frontend:** React 18, Vite 7, Tailwind CSS, framer-motion, axios
- **Backend:** Express 4, Prisma 5 (CockroachDB-compatible), JWT auth, Nodemailer
- **AI pipeline:** self-hosted GPU endpoints (chat / vision / multimodal) with offline demo fallbacks
- **Local database:** embedded PostgreSQL on port `5433` (no install required)

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in at least DATABASE_URL and JWT_SECRET
npm run db:local            # start embedded postgres, push schema, seed demo campus
npm run dev                 # serve API on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # serve SPA on http://localhost:5173
```

## Demo accounts

| Persona | Identifier | Password |
| --- | --- | --- |
| Platform Admin | `admin.support@amylearn.app` | `amylearn@admin123` |
| Platform Manager | `manager.ops@amylearn.app` | `amylearn@mgr123` |
| Campus Admin | `admin.campus@amylearn.demo` | `campus@admin123` |
| Faculty | `faculty.campus@amylearn.demo` | `campus@faculty123` |
| Student | `NBR2024CS042` | `campus@student123` |

Demo tenant: **Northbridge University** (college code `NBR`).

## Verification

```bash
cd backend
npm test          # smoke: health, auth cycle, tenant isolation
npm run e2e       # feature sweep: notices, attendance, LMS, library, leave, COE
npm run compare   # every frontend endpoint vs registered backend routes
npm run audit     # route map, schema map, brand hygiene
cd ../frontend
npm run build     # production build
```

## Architecture notes

- **Tenant isolation is logical.** `setTenantContext` resolves JWT → user → membership → tenant; every query filters by `tenantId`.
- **Portals are tab-based SPAs.** Module navigation is `activeTab` state, not URL routes.
- **One axios instance** carries auth and tenant headers for the whole frontend.
- **Serverless-ready backend.** The Express app is exported; it only calls `listen()` outside production. Deploys via `backend/vercel.json` with cron routes for cleanup and DB keep-alive.
- **Local database** runs via `backend/scripts/localDb.js` (embedded-postgres); `prisma/schema.local.prisma` swaps the provider for local dev while `schema.prisma` stays CockroachDB-compatible.
