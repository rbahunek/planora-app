import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import { E2E_EMAIL, E2E_TEMP_PASSWORD } from "./constants";

// Run via `npx tsx` (not the Playwright loader) so the generated Prisma client
// loads correctly. Creates/removes a deterministic E2E user.
async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const cmd = process.argv[2];

  if (cmd === "create") {
    const { hashPassword } = await import("../src/lib/password");
    const role = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
    // Start from a clean slate for a deterministic run.
    await prisma.user.deleteMany({ where: { email: E2E_EMAIL } });
    await prisma.user.create({
      data: {
        firstName: "E2E",
        lastName: "Test",
        email: E2E_EMAIL,
        passwordHash: await hashPassword(E2E_TEMP_PASSWORD),
        roleId: role.id,
        accountStatus: "ACTIVE",
        mustChangePassword: true,
      },
    });
    console.log(`E2E user ready: ${E2E_EMAIL}`);
  } else if (cmd === "delete") {
    await prisma.user.deleteMany({ where: { email: E2E_EMAIL } });
    console.log("E2E user removed");
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
