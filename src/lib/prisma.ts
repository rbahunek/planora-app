import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 runtime uses a driver adapter. Neon's serverless WebSocket pool
// supports transactions and works on both Node and Vercel serverless.
// Runtime connects through the POOLED connection string (DATABASE_URL);
// migrations use DIRECT_URL via prisma.config.ts.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: the underlying client is created only on the first actual use
// (a query/property access), NOT when this module is imported. This lets
// `next build` collect page data without DATABASE_URL being set — the env var
// is only required when a request actually touches the database at runtime.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
