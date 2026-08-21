import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ROLES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/lib/auth/constants";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { changeUserPassword, verifyLoginCredentials } from "@/server/auth-service";
import type { AccountStatus } from "@/generated/prisma/enums";

const createdUserIds: string[] = [];
let developerRoleId: string;
let counter = 0;

function uniqueEmail() {
  counter += 1;
  return `test-${Date.now()}-${counter}@planora.test`;
}

async function createTestUser(options: {
  password?: string;
  accountStatus?: AccountStatus;
  mustChangePassword?: boolean;
}) {
  const email = uniqueEmail();
  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "Korisnik",
      email,
      passwordHash: options.password ? await hashPassword(options.password) : null,
      roleId: developerRoleId,
      accountStatus: options.accountStatus ?? "ACTIVE",
      mustChangePassword: options.mustChangePassword ?? false,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

beforeAll(async () => {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: ROLES.DEVELOPER } });
  developerRoleId = role.id;
});

afterAll(async () => {
  // Deleting the user cascades to their audit logs.
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

describe("verifyLoginCredentials", () => {
  it("authorizes an active user with the correct password", async () => {
    const user = await createTestUser({ password: "Sigurna123", mustChangePassword: true });
    const result = await verifyLoginCredentials(user.email, "Sigurna123");

    expect(result).not.toBeNull();
    expect(result?.role).toBe(ROLES.DEVELOPER);
    expect(result?.mustChangePassword).toBe(true);

    const refreshed = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(refreshed.failedLoginAttempts).toBe(0);
    expect(refreshed.lastLoginAt).not.toBeNull();
  });

  it("returns null and counts a failed attempt on wrong password", async () => {
    const user = await createTestUser({ password: "Sigurna123" });
    const result = await verifyLoginCredentials(user.email, "Pogresna123");

    expect(result).toBeNull();
    const refreshed = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(refreshed.failedLoginAttempts).toBe(1);
  });

  it("rejects a non-active (INACTIVE) account even with the correct password", async () => {
    const user = await createTestUser({ password: "Sigurna123", accountStatus: "INACTIVE" });
    expect(await verifyLoginCredentials(user.email, "Sigurna123")).toBeNull();
  });

  it("rejects a BLOCKED account", async () => {
    const user = await createTestUser({ password: "Sigurna123", accountStatus: "BLOCKED" });
    expect(await verifyLoginCredentials(user.email, "Sigurna123")).toBeNull();
  });

  it("returns null for a non-existent email", async () => {
    expect(await verifyLoginCredentials("nepostoji@planora.test", "Sigurna123")).toBeNull();
  });

  it("locks the account after too many failed attempts", async () => {
    const user = await createTestUser({ password: "Sigurna123" });

    for (let i = 0; i < MAX_FAILED_LOGIN_ATTEMPTS; i += 1) {
      await verifyLoginCredentials(user.email, "Pogresna123");
    }

    const locked = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(locked.lockedUntil).not.toBeNull();
    expect(locked.lockedUntil!.getTime()).toBeGreaterThan(Date.now());

    // Even the correct password is rejected while locked.
    expect(await verifyLoginCredentials(user.email, "Sigurna123")).toBeNull();
  });
});

describe("changeUserPassword", () => {
  it("fails when the current password is wrong", async () => {
    const user = await createTestUser({ password: "Staro12345" });
    const result = await changeUserPassword(user.id, "Krivo12345", "Novo123456");
    expect(result.ok).toBe(false);
  });

  it("changes the password, clears mustChangePassword, and the new password works", async () => {
    const user = await createTestUser({ password: "Staro12345", mustChangePassword: true });

    const result = await changeUserPassword(user.id, "Staro12345", "Novo123456");
    expect(result.ok).toBe(true);

    const refreshed = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(refreshed.mustChangePassword).toBe(false);

    // Old password no longer works; new one does.
    expect(await verifyLoginCredentials(user.email, "Staro12345")).toBeNull();
    expect(await verifyLoginCredentials(user.email, "Novo123456")).not.toBeNull();
  });
});
