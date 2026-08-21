# Planora – Architecture (working document)

> Living document. Expanded per phase. Language policy: **code/DB/API in English,
> visible UI in Croatian.**

## Stack

| Concern       | Choice                                          |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 16 (App Router)                         |
| Language      | TypeScript (strict)                             |
| UI            | React 19 + Tailwind CSS v4                      |
| Database      | PostgreSQL on Neon                              |
| ORM           | Prisma 7 (query compiler + Neon driver adapter) |
| Validation    | Zod                                             |
| Auth          | Auth.js v5 (Credentials), JWT sessions          |
| Password hash | argon2id (`@node-rs/argon2`)                    |
| Testing       | Vitest (unit/integration) + Playwright (E2E)    |
| Tooling       | ESLint + Prettier                               |
| Deployment    | Vercel                                          |

## Folder structure

```
prisma/            Prisma schema, migrations, seed
src/
  app/             App Router routes + Route Handlers (route groups per area)
  components/      Reusable UI components (Croatian labels)
  lib/             Cross-cutting: prisma client, auth, session, rbac, env
  server/          Server-side business logic / services
  validation/      Zod schemas (shared client/server)
  types/           Shared TypeScript types
tests/             Unit + integration tests
e2e/               Playwright end-to-end tests
docs/              Architecture, ER model, Neon setup, thesis material
```

## Security decisions (Phase 1)

- Custom auth flows (temporary passwords, forced change, account lockout) implemented on top
  of Auth.js v5 Credentials with a JWT session strategy.
- Passwords hashed with **argon2id**; hashes never leave the server, never returned via API.
- Authorization enforced **server-side** in every Route Handler / Server Action — never relying
  on hidden UI only.
- Secrets only in `.env.local` (git-ignored); `.env.example` holds placeholders.
- Audit metadata must never contain passwords, hashes, or session values.

## Authentication & authorization (Phase 3)

- **Split Auth.js config** for Edge/Node separation:
  - `src/auth.config.ts` — Edge-safe (no Prisma/argon2): pages, JWT session strategy,
    `jwt`/`session` callbacks. Used by the middleware.
  - `src/auth.ts` — Node config with the Credentials provider; `authorize()` delegates to the
    login service.
- **`src/middleware.ts`** (must live under `src/` when using a `src/` dir) enforces:
  unauthenticated → `/login`; `mustChangePassword` → confined to `/promjena-lozinke`;
  `/admin/*` → ADMIN only.
- **`src/server/auth-service.ts`** holds the testable login/password-change logic:
  status/lockout checks, failed-attempt counting (lock after
  `MAX_FAILED_LOGIN_ATTEMPTS`), argon2 verification with a dummy-hash timing guard against
  account enumeration, and audit writes.
- Custom fields (`role`, `mustChangePassword`) flow into the JWT/session via callbacks and are
  typed in `src/types/next-auth.d.ts` (JWT augmentation targets `@auth/core/jwt`).
- Session token updated in place after a password change via `unstable_update`.

## Application modules

- **Administration** (`/admin/*`, `user-service`, `audit-service`) — user CRUD, activation via
  temporary password, reset, block/unblock, role change, and the audit-log view. Self-guards
  prevent an admin from blocking their own account or removing their own admin role.
- **Project management** (`/projekti`, `/timovi`, `/zadaci`, `/oznake`) — teams and members,
  projects and team assignment, tasks with status/priority/assignee/labels/dates, task filtering,
  and labels. `canManage` (ADMIN/PROJECT_MANAGER) gates management; a task assignee may change
  their task's status (`canUpdateTaskStatus`).
- **Time & feedback** (`/vrijeme`, `/feedback`, `/admin/feedback`, `time-service`,
  `feedback-service`) — time entries with **server-computed duration** (client duration is never
  trusted; `endTime > startTime` enforced) and feedback with an optional 1–5 rating and optional
  attachment-URL metadata (no file upload until a provider is chosen).
- Shared `ServiceResult<T>` type (`src/server/result.ts`) gives services a uniform ok/error shape.

## Forced-password-change routing

After a Server-Action `signIn`, a Next.js soft (client) navigation does not follow a subsequent
middleware/layout redirect. The **login action therefore computes the destination itself**
(`/promjena-lozinke` when `mustChangePassword`, else `/dashboard`). Middleware and the `(app)`
layout keep enforcing the same rule for direct navigations (defense in depth).

## Testing

- **Vitest** (`vitest.config.mts`): unit tests (validation, password hashing) and DB integration
  tests for every service (`auth`, `user`, project management, time/feedback), each creating and
  cleaning up its own temporary data. `tests/setup.ts` loads `.env.local`. 42 tests / 6 files.
- **Playwright** (`e2e/`): critical login → forced-change → dashboard flow plus invalid-login
  rejection. A `tsx` global setup/teardown creates and removes a deterministic E2E user (run
  outside the Playwright loader so the generated Prisma client loads correctly).

## Accessibility & responsiveness

Inputs are bound to `<label htmlFor>`; submit buttons expose `aria-busy`; alerts use
`role="alert"`; `lang="hr"` is set. Layouts use responsive flex/grid utilities and wrap wide
tables in horizontally scrollable containers.

## Open items / known notes

- Multi-session invalidation on password change (JWT strategy rotates only the current token).
- Feedback file uploads pending a chosen storage provider (only attachment-URL metadata today).
- `DIRECT_URL` ideally points to the non-pooled Neon endpoint (currently works via the pooler).
- Next.js 16 deprecates the `middleware` filename in favour of `proxy`; the current
  `src/middleware.ts` still works (a warning is emitted) and can be migrated later.
