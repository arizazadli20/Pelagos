# PEYKGÖZ

**Satellite & AI oil spill intelligence for the Caspian Sea**

PEYKGÖZ is a Next.js operational demo platform that helps operators detect, review, and respond to potential oil spills using satellite-oriented workflows and AI-assisted analysis. It provides a landing site, mock authentication, a maritime dashboard, and multi-page ops tools (incidents, vessels, AI analysis, response, reports) backed by centralized mock data designed to be replaced by real APIs later.

---

## Key Features

- **Public landing page** — Product overview for satellite monitoring, AI analysis, vessel intelligence, and human-in-the-loop response
- **Mock authentication** — Login / register flows with client-side session storage and cookie sync for route protection
- **Protected operational shell** — Shared app chrome (`AppShell`, header, sidebar) around authenticated pages
- **Mission dashboard** — Caspian Sea map (Leaflet), KPIs, recent incidents, and activity feed
- **Incidents workspace** — Search/filter/sort table, risk and status badges, and a detail panel
- **Human-in-the-loop (HITL) review** — Confirm, reject, escalate, or mark cleaning actions that update shared incident state
- **Vessels** — Vessel context linked to operational incidents
- **AI Analysis** — Structured AI analysis views derived from mock incident intelligence
- **Response** — Response / cleanup oriented operational view
- **Reports** — Summary/reporting view over mock operational data
- **Account** — Operator account surface within the authenticated shell
- **Centralized domain models** — Shared TypeScript types in `lib/types.ts`
- **Shared incident store** — In-memory React context (`lib/incident-store.tsx`) so dashboard, incidents, and HITL actions stay in sync
- **Middleware route guards** — Unauthenticated users are redirected away from ops routes; authenticated users are redirected away from `/login` and `/register`
- **Copernicus token proxy** — Optional Next.js API route that requests an access token from the Copernicus Data Space Ecosystem identity endpoint

> Most operational data is currently mocked. Auth is also mock (localStorage + cookie), not a production identity provider.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | Next.js **16** (App Router) |
| UI | React **19**, Tailwind CSS **v4**, Lucide icons |
| Animation | Framer Motion |
| Maps | Leaflet + react-leaflet (OpenStreetMap tiles) |
| Charts / layout libs | Recharts, react-grid-layout *(present in deps / legacy widgets)* |
| Auth (current phase) | Client-side mock (`lib/auth.ts`) + Next.js `middleware.ts` cookie checks |
| Data | Local mock modules (`lib/mock-data.ts`) + React context store |
| Lint | ESLint (`eslint-config-next`) |
| Package manager | npm |

**Not used in this repository (yet):** database, Docker / Compose, GraphQL, gRPC, or a required `.env` file for the main demo flow.

---

## Architecture & Project Structure

### Architecture (current phase)

```text
Browser
  │
  ├─ Public routes: / , /login , /register
  │
  ├─ middleware.ts  ── cookie guard ──► /login?next=…
  │
  └─ Protected AppShell pages
        │
        ├─ IncidentStoreProvider (client state)
        │     └─ seeded from lib/mock-data.ts
        │
        └─ Pages: dashboard, incidents, vessels,
                  ai-analysis, response, reports, account

Optional API:
  GET /api/copernicus-token  →  Copernicus CDSE token endpoint
```

- **Frontend-first monolith**: a single Next.js app (no microservices).
- **REST surface today**: one App Router API route (`/api/copernicus-token`).
- **Data flow**: mock seed data → shared incident store → pages/components; HITL actions mutate store state in memory for the session.
- **Auth flow**: login/register write localStorage + `peykgoz-auth` cookie; middleware protects ops routes; logout clears session and returns to the landing page.

### Directory layout

```text
Pelagos/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout + metadata
│   ├── globals.css              # Global styles / theme
│   ├── login/                   # Login
│   ├── register/                # Register
│   ├── dashboard/               # Ops dashboard
│   ├── incidents/               # Incidents list + filters
│   ├── vessels/                 # Vessels
│   ├── ai-analysis/             # AI analysis
│   ├── response/                # Response ops
│   ├── reports/                 # Reports
│   ├── account/                 # Account
│   └── api/copernicus-token/    # Token proxy route
├── components/
│   ├── AppShell.tsx             # Auth + layout shell + store provider
│   ├── Header.tsx / Sidebar.tsx
│   ├── MapPanel.tsx             # Leaflet map
│   ├── landing/                 # Landing UI
│   ├── auth/                    # Auth form UI
│   ├── incidents/               # Incident detail / HITL panel
│   └── ui/                      # Shared UI primitives
├── lib/
│   ├── auth.ts                  # Mock auth helpers
│   ├── mock-data.ts             # Seed / derived mock data
│   ├── incident-store.tsx       # Shared client state
│   ├── types.ts                 # Domain types
│   └── nav.ts                   # Nav ids / routes / enabled items
├── middleware.ts                # Route protection
├── next.config.ts
├── package.json
└── public/                      # Static assets
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (aligned with `@types/node` / modern Next.js tooling)
- **npm** 10+ (ships with recent Node installs)
- A modern browser

No database, Docker, or API keys are required to run the main mock demo.

### Installation & Setup

```bash
git clone https://github.com/arizazadli20/Pelagos.git
cd Pelagos
npm install
```

No `.env` file is required for local development of the mock auth / mock data experience.

> **Security note:** `app/api/copernicus-token/route.ts` currently contains Copernicus client credentials in source. Prefer moving those to environment variables before any shared or production deployment, and rotate any credentials that have been committed.

### Running the Application

**Development**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production build**

```bash
npm run build
npm start
```

**Lint**

```bash
npm run lint
```

> Scripts use the `--webpack` flag (`next dev --webpack` / `next build --webpack`) as configured in `package.json`.

### Suggested local walkthrough

1. Visit `/` (landing page)
2. Open `/register` or `/login` and create/sign into a mock session
3. You should land on `/dashboard`
4. Explore `/incidents`, `/vessels`, `/ai-analysis`, `/response`, `/reports`, `/account`
5. Log out from the header — you return to `/`

**Route protection behavior**

| State | Action | Result |
| --- | --- | --- |
| Unauthenticated | Visit `/dashboard` (or other ops routes) | Redirect to `/login` |
| Authenticated | Visit `/login` or `/register` | Redirect to `/dashboard` |
| Authenticated | Log out | Session cleared → `/` |

---

## API Endpoints / Usage

### Application routes (pages)

| Path | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Mock login |
| `/register` | Public | Mock registration |
| `/dashboard` | Protected | Map, KPIs, recent incidents, activity |
| `/incidents` | Protected | Incident table, filters, detail + HITL |
| `/vessels` | Protected | Vessel intelligence view |
| `/ai-analysis` | Protected | AI analysis view |
| `/response` | Protected | Response / cleanup view |
| `/reports` | Protected | Reporting view |
| `/account` | Protected | Account view |

### API routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/copernicus-token` | Proxies a client-credentials token request to the Copernicus Data Space Ecosystem identity service and returns the JSON token response (or an error payload) |

Example:

```bash
curl http://localhost:3000/api/copernicus-token
```

### Replacing mock data later

Operational pages are designed around:

- `lib/types.ts` — domain shapes
- `lib/mock-data.ts` — seed + derived helpers
- `lib/incident-store.tsx` — client-side shared state / HITL mutations

A future backend integration should keep those TypeScript shapes stable so UI pages can stay mostly unchanged.

---

## Environment Variables

The main app flow does **not** currently read `process.env` configuration.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| *(none for mock demo)* | — | Landing, auth, dashboard, ops pages | Auth uses browser `localStorage` + the `peykgoz-auth` cookie |
| `COPERNICUS_CLIENT_ID` *(recommended)* | No (not wired yet) | Intended for `/api/copernicus-token` | Credentials are currently hardcoded in the route file |
| `COPERNICUS_CLIENT_SECRET` *(recommended)* | No (not wired yet) | Intended for `/api/copernicus-token` | Move out of source before deploying |

Cookie / storage keys (not env vars, but important runtime identifiers):

| Key | Where | Purpose |
| --- | --- | --- |
| `peykgoz-auth` | Cookie + localStorage flag | Middleware / client auth gate |
| `peykgoz-user` | localStorage | Stored mock user profile (`name`, `email`) |

---

## License

Private project (`"private": true` in `package.json`).
