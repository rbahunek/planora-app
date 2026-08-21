# Planora

Full-stack web application for managing **projects, teams, tasks, work time, labels,
priorities, statuses and user feedback**, with secure e‑mail/password authentication and
role-based access control.

> Language policy: **code, database and API are in English; the visible UI is in Croatian.**

## Tech stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router) · React 19              |
| Language   | TypeScript (strict)                             |
| Styling    | Tailwind CSS v4                                 |
| Database   | PostgreSQL on [Neon](https://neon.tech)         |
| ORM        | Prisma 7 (query compiler + Neon driver adapter) |
| Validation | Zod                                             |
| Auth       | Auth.js v5 (Credentials, JWT sessions)          |
| Hashing    | argon2id (`@node-rs/argon2`)                    |
| Testing    | Vitest (unit + integration) · Playwright (E2E)  |
| Tooling    | ESLint · Prettier                               |
| Deployment | Vercel                                          |

## Prerequisites

- Node.js 20+ (developed on Node 26)
- A Neon PostgreSQL project (see [`docs/neon-setup.md`](docs/neon-setup.md))

## Getting started

```bash
# 1. Install dependencies (runs `prisma generate` via postinstall)
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in .env.local (see below) — never commit it

# 3. Apply the database schema and seed reference data + the first admin
npm run db:migrate       # creates tables (uses DIRECT_URL)
npm run db:seed          # roles, statuses, priorities + initial admin

# 4. Run the app
npm run dev              # http://localhost:3000
```

### Environment variables (`.env.local`)

```env
DATABASE_URL="<Neon pooled connection string>"   # runtime (pooled)
DIRECT_URL="<Neon direct connection string>"      # migrations (direct)
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"

# Initial administrator (used once by the seed; must change password on first login)
SEED_ADMIN_EMAIL=""
SEED_ADMIN_FIRST_NAME=""
SEED_ADMIN_LAST_NAME=""
SEED_ADMIN_PASSWORD=""
```

Secrets live only in `.env.local` (git-ignored). `.env.example` holds placeholders only.

## Scripts

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Production build                    |
| `npm start`          | Run the production build            |
| `npm run lint`       | ESLint                              |
| `npm run typecheck`  | `tsc --noEmit`                      |
| `npm run format`     | Prettier (write)                    |
| `npm test`           | Vitest unit + integration tests     |
| `npm run e2e`        | Playwright end-to-end tests         |
| `npm run db:migrate` | Create/apply a migration (dev)      |
| `npm run db:seed`    | Seed reference data + initial admin |
| `npm run db:studio`  | Prisma Studio                       |

## Project structure

```
prisma/            Prisma schema, migrations, idempotent seed
prisma.config.ts   Prisma 7 config (connection URLs, seed command)
src/
  app/
    (auth)/        Login, forced password change
    (app)/         Authenticated area: dashboard, projekti, timovi,
                   zadaci, vrijeme, feedback, admin/*
    api/auth/      Auth.js route handler
  auth.ts          Auth.js (Node) — Credentials provider
  auth.config.ts   Auth.js (Edge-safe) — used by middleware
  middleware.ts    Route protection (auth, forced change, admin gate)
  components/      Reusable UI (Croatian labels)
  lib/             prisma, auth (session/rbac/constants), password, dates, labels
  server/          Business logic services (auth, user, team, project, task, ...)
  validation/      Zod schemas
tests/             Vitest unit + integration tests
e2e/               Playwright tests
docs/              Architecture, ER model, Neon setup, thesis summary
```

## Testing

```bash
npm test      # Vitest: validation, hashing, and DB-backed service integration tests
npm run e2e   # Playwright: critical login → forced password change → dashboard flow
```

Integration and E2E tests create and clean up their own temporary data in the database.

## Security highlights

- Passwords hashed with **argon2id**; hashes never leave the server or an API response.
- **Role-based access control** enforced server-side in every Server Action / Route Handler —
  not only via hidden UI.
- Administrator-generated **temporary passwords**: cryptographically secure, stored only as a
  hash, shown once, and the account is forced to change it on first login.
- Account **lockout** after repeated failed logins; **blocked** accounts cannot authenticate.
- **Audit log** of security-relevant events (never storing secrets).

## Deployment (Vercel)

Set the same environment variables in the Vercel project. `postinstall` runs `prisma generate`;
run `npm run db:migrate:deploy` against the production database as part of your release process.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — architecture & decisions
- [`docs/er-model.md`](docs/er-model.md) — data model & ER diagram
- [`docs/neon-setup.md`](docs/neon-setup.md) — database setup
- [`docs/thesis-summary.md`](docs/thesis-summary.md) — technical summary for the thesis
