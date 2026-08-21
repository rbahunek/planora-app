import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads .env. Load local env for CLI commands
// (migrate / db / studio). Prefer .env.local, fall back to .env.
loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Runs after `prisma migrate dev` / `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations and introspection use the DIRECT (non-pooled) connection.
    // Read via process.env (not Prisma's env()) so `prisma generate` can run
    // during install without secrets; migration commands still require a real
    // DIRECT_URL and will fail clearly if it is empty.
    url: process.env.DIRECT_URL ?? "",
  },
});
