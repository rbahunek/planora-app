# Neon PostgreSQL – Setup

Planora uses a PostgreSQL database hosted on [Neon](https://neon.tech). This must be
created manually (no authenticated Neon CLI/API/MCP is available in this environment).

## Steps

1. Sign in to <https://console.neon.tech>.
2. Create a new **project** named `planora`.
3. Select the **region** closest to the application's users (e.g. `eu-central-1` for Croatia).
4. Neon creates a default database. Rename it or create one named `planora` (production database).
5. Open **Connection Details** and copy **both** connection strings:
   - **Pooled** connection string → used at runtime (`DATABASE_URL`).
   - **Direct** connection string → used for migrations (`DIRECT_URL`).
6. Create a local `.env.local` file (copy from `.env.example`) and paste the values there:

   ```env
   DATABASE_URL="<Neon pooled connection string>"
   DIRECT_URL="<Neon direct connection string>"
   ```

> Never paste connection strings into chat, commit them, or print them in logs.
> `.env.local` is git-ignored by default.

## Why two URLs?

- The **pooled** URL routes through Neon's PgBouncer connection pooler, which is required for
  serverless / edge runtimes where many short-lived connections are opened.
- The **direct** URL bypasses the pooler and is required by Prisma's schema engine for
  running and introspecting migrations.

## Prisma + Neon (Prisma 7)

Prisma 7 uses the Rust-free **query compiler** with **driver adapters**. Planora will use the
Neon serverless driver adapter (`@prisma/adapter-neon` + `@neondatabase/serverless`),
configured in Phase 2. Migrations are run against `DIRECT_URL`.
