import { config as loadEnv } from "dotenv";

// Load env BEFORE importing modules that read process.env at import time.
loadEnv({ path: ".env.local" });
loadEnv();

import { seedDemoData } from "./demo-seed";

const ROLES = [
  {
    name: "ADMIN",
    description: "Upravljanje korisnicima, pristupima, ulogama i cijelim sustavom",
  },
  {
    name: "PROJECT_MANAGER",
    description: "Upravljanje projektima, timovima, zadacima i izvještajima",
  },
  { name: "DEVELOPER", description: "Rad na dodijeljenim zadacima i evidencija vremena" },
  { name: "TESTER", description: "Testiranje funkcionalnosti i prijava problema" },
] as const;

const STATUSES = [
  { name: "TODO", description: "Za napraviti", sortOrder: 1 },
  { name: "IN_PROGRESS", description: "U tijeku", sortOrder: 2 },
  { name: "IN_REVIEW", description: "Na provjeri", sortOrder: 3 },
  { name: "DONE", description: "Završeno", sortOrder: 4 },
] as const;

const PRIORITIES = [
  { name: "LOW", description: "Nizak", sortOrder: 1 },
  { name: "MEDIUM", description: "Srednji", sortOrder: 2 },
  { name: "HIGH", description: "Visok", sortOrder: 3 },
  { name: "CRITICAL", description: "Kritičan", sortOrder: 4 },
] as const;

async function main() {
  // Dynamic imports so env is loaded before the Prisma client is first used.
  const { prisma } = await import("../src/lib/prisma");
  const { hashPassword } = await import("../src/lib/password");

  // --- Reference data (idempotent upserts by unique name) ---
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  for (const status of STATUSES) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: { description: status.description, sortOrder: status.sortOrder },
      create: status,
    });
  }
  for (const priority of PRIORITIES) {
    await prisma.priority.upsert({
      where: { name: priority.name },
      update: { description: priority.description, sortOrder: priority.sortOrder },
      create: priority,
    });
  }
  console.log(
    `Seeded ${ROLES.length} roles, ${STATUSES.length} statuses, ${PRIORITIES.length} priorities.`,
  );

  // --- Initial administrator (find-or-create; never overwrite an existing password) ---
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim();
  const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  let adminUserId: string | null = null;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      adminUserId = existing.id;
      console.log(`Admin '${email}' already exists — leaving password untouched.`);
    } else if (firstName && lastName && password) {
      const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
      const created = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: await hashPassword(password),
          roleId: adminRole.id,
          accountStatus: "ACTIVE",
          mustChangePassword: true,
        },
      });
      adminUserId = created.id;
      console.log(`Created initial admin '${email}' (must change password on first login).`);
    }
  }

  // Fall back to any existing administrator (e.g. when SEED_ADMIN_* is unset).
  if (!adminUserId) {
    const anyAdmin = await prisma.user.findFirst({ where: { role: { name: "ADMIN" } } });
    adminUserId = anyAdmin?.id ?? null;
  }

  if (!adminUserId) {
    console.warn(
      "Skipping demo seed: no administrator available. Set SEED_ADMIN_* in .env.local first.",
    );
    return;
  }

  // --- Demo data (idempotent) ---
  await seedDemoData(adminUserId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
