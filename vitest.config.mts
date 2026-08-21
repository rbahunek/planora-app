import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    // Integration tests share one database; run files serially to avoid races.
    fileParallelism: false,
    // argon2 hashing makes some tests slower than the default 5s.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
