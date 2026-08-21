# Planora – Technical Summary (thesis material)

This document summarizes the design and implementation of **Planora** for the accompanying
graduate thesis. It is written to be quotable and to map cleanly onto typical thesis chapters
(problem, requirements, architecture, data model, security, testing, evaluation).

## 1. Problem and scope

Planora is a web application for managing software-project work: **projects, teams, tasks,
work-time tracking, task labels/statuses/priorities, and user feedback**, on top of secure
authentication and role-based authorization. The visible interface is in Croatian; all code,
database objects and API fields are in English.

The delivered scope covers: authentication (login/logout, forced password change), a protected
dashboard, full user administration (create, edit, activate via temporary password, reset,
block/unblock, role change), teams, projects, tasks with labels/statuses/priorities and
filtering, time tracking with server-side duration calculation, feedback submission, and an
admin-only audit log.

## 2. Architecture

Planora is a single Next.js 16 application using the **App Router**, combining server-rendered
UI and server-side business logic:

- **Presentation** — React Server Components render Croatian UI; small Client Components handle
  interactive forms via React 19 `useActionState`.
- **Application/business logic** — plain TypeScript **service modules** in `src/server/*`
  (`auth-service`, `user-service`, `team-service`, `project-service`, `task-service`,
  `time-service`, `feedback-service`). Services are framework-agnostic and directly unit/
  integration-tested.
- **Server Actions** (`"use server"`) are thin controllers: they authenticate/authorize,
  validate input with **Zod**, call a service, and revalidate/redirect.
- **Data access** — Prisma 7 with the **query compiler** and the **Neon serverless driver
  adapter**. The runtime uses the pooled connection; migrations use the direct connection.

This layering keeps HTTP/UI concerns separate from business rules, which is what makes the core
logic straightforward to test without a running server.

### Authentication & authorization

- **Auth.js v5** with a **Credentials** provider and a **JWT session strategy**. The config is
  split into an Edge-safe part (`auth.config.ts`, used by the middleware) and a Node part
  (`auth.ts`, which performs Prisma/argon2 work in `authorize()`), because middleware runs in
  the Edge runtime.
- Custom claims (`role`, `mustChangePassword`) flow into the JWT and session via callbacks.
- **Middleware** (`src/middleware.ts`) enforces: unauthenticated → login; users who must change
  their password are confined to that flow; `/admin/*` requires the ADMIN role. Authorization is
  additionally enforced **server-side** in every Server Action and admin page (defense in depth),
  never relying on hidden UI alone.

### Security decisions

- Passwords are hashed with **argon2id** (OWASP parameters); hashes never leave the server and
  are never returned by an API.
- Login verification uses a constant dummy-hash comparison for unknown accounts to reduce
  **account-enumeration** via response timing.
- **Account lockout** after five failed attempts (15-minute window); `BLOCKED` accounts cannot
  authenticate.
- **Administrator-generated temporary passwords** are cryptographically secure, stored only as a
  hash, shown to the admin exactly once, never logged or persisted in plaintext, and force a
  password change on first login.
- An **audit log** records security-relevant events (user creation, activation, temporary-
  password generation, resets, role changes, block/unblock, logins, lockouts) and never stores
  passwords, hashes or session values.

## 3. Data model

UUID primary keys and timestamps throughout. Core entities: `User`, `Role`, `Team`, `UserTeam`,
`Project`, `ProjectTeam`, `Task`, `Status`, `Priority`, `Label`, `TaskLabel`, `TimeEntry`,
`Feedback`, `AuditLog`. Many-to-many relations use composite primary keys (`UserTeam`,
`ProjectTeam`, `TaskLabel`). Referential actions are chosen per relationship (e.g. `Restrict` on
a role in use, `SetNull` for a task assignee, `Cascade` for join rows and a project's tasks).
Business rules enforced outside the schema include `TimeEntry.endTime > startTime` with a
server-computed duration, and the feedback rating range. See [`er-model.md`](er-model.md).

## 4. Technology rationale

- **Next.js App Router + Server Actions** unify UI and mutations with minimal client JS and give
  first-class server-side authorization boundaries.
- **Prisma 7** provides a typed data layer; its query compiler + Neon adapter suit serverless
  deployment on Vercel.
- **Auth.js v5 Credentials + JWT** was chosen over Neon Auth / managed identity because the
  requirements (temporary passwords, forced change, lockout, audit, argon2id) demand full control
  over the credential lifecycle.
- **Zod** gives a single validation definition reusable across client and server.

## 5. Testing strategy

- **Unit tests** — validation schemas and password hashing.
- **Integration tests** (Vitest, against the real database) — the service layer: authentication
  and lockout, temporary-password issuance and reset, user administration and self-guards, team/
  project/task management, filtering, and time/feedback logic. Tests create and delete their own
  temporary data.
- **End-to-end test** (Playwright) — the critical flow: logging in with a temporary password is
  forced through the password-change screen before reaching the dashboard, plus rejection of an
  invalid password.
- Every phase is gated on Prettier, ESLint, `tsc --noEmit`, the test suite, and a production
  build.

At the time of writing the suite comprises 42 Vitest tests across 6 files and 2 Playwright tests.

## 6. Notable engineering findings

- **Prisma 7** removed `url`/`directUrl` from `schema.prisma`; connection URLs now live in
  `prisma.config.ts`, and the client is constructed with a driver adapter.
- With a `src/` directory, Next.js expects the middleware at `src/middleware.ts` (not the repo
  root) — otherwise it silently does not run.
- After a Server-Action `signIn`, a Next.js **soft (client) navigation** would not follow a
  subsequent middleware/layout redirect, so the login action itself computes the destination
  (`/promjena-lozinke` vs `/dashboard`); middleware and the app layout remain as defense in depth
  for direct navigations.

## 7. Accessibility & responsiveness

Forms use `<label htmlFor>` bound to inputs, submit buttons expose `aria-busy` while pending, and
error/success messages use `role="alert"`. Layouts use responsive Tailwind utilities (flex/grid,
`max-width`, and horizontally scrollable tables) and the document declares `lang="hr"`.

## 8. Possible future work

- Full multi-session invalidation on password change (currently the JWT strategy rotates only the
  current session token).
- File attachments for feedback once a storage provider and its security rules are chosen (only
  attachment URL metadata is stored today).
- Reporting/aggregation over logged time per project or user.
