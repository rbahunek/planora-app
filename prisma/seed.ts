import { config as loadEnv } from "dotenv";

// Load env BEFORE importing modules that read process.env at import time
// (the Prisma client singleton reads DATABASE_URL when instantiated).
loadEnv({ path: ".env.local" });
loadEnv();

const ROLES = [
  { name: "ADMIN", description: "Administrator sustava" },
  { name: "PROJECT_MANAGER", description: "Voditelj projekta" },
  { name: "DEVELOPER", description: "Programer" },
  { name: "TESTER", description: "Tester" },
] as const;

const STATUSES = [
  { name: "TODO", description: "Za napraviti", sortOrder: 1 },
  { name: "IN_PROGRESS", description: "U tijeku", sortOrder: 2 },
  { name: "IN_REVIEW", description: "Na pregledu", sortOrder: 3 },
  { name: "DONE", description: "Završeno", sortOrder: 4 },
] as const;

const PRIORITIES = [
  { name: "LOW", description: "Niski", sortOrder: 1 },
  { name: "MEDIUM", description: "Srednji", sortOrder: 2 },
  { name: "HIGH", description: "Visoki", sortOrder: 3 },
  { name: "CRITICAL", description: "Kritični", sortOrder: 4 },
] as const;

async function main() {
  // Dynamic imports so env is loaded before the Prisma client is constructed.
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

  // --- Initial administrator ---
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim();
  const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !firstName || !lastName || !password) {
    console.warn(
      "Skipping admin seed: set SEED_ADMIN_EMAIL, SEED_ADMIN_FIRST_NAME, " +
        "SEED_ADMIN_LAST_NAME and SEED_ADMIN_PASSWORD in .env.local to create the initial admin.",
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Idempotent: never overwrite an existing administrator's password.
    console.log(`Admin '${email}' already exists — leaving password untouched.`);
    return;
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId: adminRole.id,
      accountStatus: "ACTIVE",
      mustChangePassword: true, // must change the seed password on first login
    },
  });
  console.log(`Created initial admin '${email}' (must change password on first login).`);
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
