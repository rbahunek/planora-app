import { describe, expect, it } from "vitest";

import { changePasswordSchema, loginSchema, strongPasswordSchema } from "@/validation/auth";

describe("loginSchema", () => {
  it("normalizes email (trim + lowercase)", () => {
    const parsed = loginSchema.parse({ email: "  User@Example.COM ", password: "x" });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("strongPasswordSchema", () => {
  it("accepts a sufficiently strong password", () => {
    expect(strongPasswordSchema.safeParse("Sigurna123").success).toBe(true);
  });

  it.each([
    ["too short", "Ab1"],
    ["no uppercase", "sigurna123"],
    ["no lowercase", "SIGURNA123"],
    ["no digit", "SigurnaLozinka"],
  ])("rejects a weak password (%s)", (_label, value) => {
    expect(strongPasswordSchema.safeParse(value).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("rejects when confirmation does not match", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Old12345aa",
      newPassword: "Nova12345a",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when new password equals current", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Nova12345a",
      newPassword: "Nova12345a",
      confirmPassword: "Nova12345a",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Staro12345",
      newPassword: "Nova12345a",
      confirmPassword: "Nova12345a",
    });
    expect(result.success).toBe(true);
  });
});
