import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("produces an argon2id hash that is not the plaintext", async () => {
    const hash = await hashPassword("Sigurna123");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain("Sigurna123");
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("Sigurna123");
    expect(await verifyPassword(hash, "Sigurna123")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sigurna123");
    expect(await verifyPassword(hash, "Pogresna123")).toBe(false);
  });

  it("produces different hashes for the same input (random salt)", async () => {
    const a = await hashPassword("Sigurna123");
    const b = await hashPassword("Sigurna123");
    expect(a).not.toBe(b);
  });
});
