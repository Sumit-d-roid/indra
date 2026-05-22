# INDRA

INDRA is an experimental personal cognitive operating system built as a dark, immersive intelligence laboratory. It is designed around neuroplasticity, adaptive challenge generation, curiosity mapping, and long-term cognitive evolution rather than productivity, corporate workflows, or habit-tracking.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, D3
- **Backend:** ASP.NET Core Web API, Entity Framework Core, JWT auth
- **Database:** PostgreSQL-ready schema with EF Core migrations

## Repository structure

```text
.
├── apps/
│   ├── api/   # ASP.NET Core API, EF Core models, services, migrations, seed data
│   └── web/   # React app with immersive INDRA UI foundations
├── Indra.slnx
└── dotnet-tools.json
```

## Included MVP foundations

### Backend

- JWT-ready auth endpoints for register, login, and profile retrieval
- Cognitive check-in endpoints with PostgreSQL-ready entities
- Adaptive challenge endpoints with response tracking
- Curiosity graph, dashboard summary, analytics, shadow module, and labyrinth module endpoints
- Seed data for a demo observer profile, metrics, challenges, nodes, and trend snapshots
- EF Core migration for the initial normalized schema:
  - users
  - cognitive_entries
  - challenges
  - challenge_responses
  - curiosity_nodes
  - curiosity_connections
  - cognitive_metrics
  - adaptation_scores
  - ai_interactions
  - trend_snapshots

### Frontend

- Immersive classified-laboratory shell with animated side navigation
- Dashboard, Check-In, Challenges, Curiosity Graph, Analytics, Settings, Shadow, Labyrinth, and Auth pages
- D3-powered neural graph prototype with drag, zoom, and pan
- Atmospheric styling, subtle motion, and terminal-like panels
- Reusable component structure with mock API abstractions for future backend integration

## Local development

### Backend

```bash
cd /home/runner/work/indra/indra/apps/api
dotnet build
dotnet run
```

Notes:

- `appsettings.Development.json` clears the connection string so local development can run with an in-memory fallback.
- `appsettings.json` contains a PostgreSQL connection string placeholder for relational environments.
- The project includes `dotnet-ef` configuration so migrations can be managed locally:

```bash
cd /home/runner/work/indra/indra
dotnet tool restore
dotnet tool run dotnet-ef database update --project apps/api/Indra.Api.csproj --startup-project apps/api/Indra.Api.csproj
```

### Frontend

```bash
cd /home/runner/work/indra/indra/apps/web
npm install
npm run dev
```

### Build validation

```bash
cd /home/runner/work/indra/indra/apps/api && dotnet build
cd /home/runner/work/indra/indra/apps/web && npm run build
```

## Default seeded observer

- **Identity:** `observer@indra.local` or `observer`
- **Password:** `Indra!2026`

This credential is for local starter/demo use only.

## Design intent

INDRA should feel like:

- a classified research project
- a cybernetic experimentation system
- an evolving intelligence engine
- a machine studying consciousness
