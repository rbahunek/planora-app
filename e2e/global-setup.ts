import { execSync } from "node:child_process";

// Create the deterministic E2E user in a separate `tsx` process (so the
// generated Prisma client loads outside the Playwright module loader).
export default function globalSetup() {
  execSync("npx tsx e2e/seed-user.ts create", { stdio: "inherit" });
}
