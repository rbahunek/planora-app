import { execSync } from "node:child_process";

export default function globalTeardown() {
  execSync("npx tsx e2e/seed-user.ts delete", { stdio: "inherit" });
}
