import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ROLES } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { verifyLoginCredentials } from "@/server/auth-service";
import {
  createUser,
  generateTemporaryCredentials,
  setUserBlocked,
  updateUser,
} from "@/server/user-service";

const createdUserIds: string[] = [];
let adminRoleId: string;
let developerRoleId: string;
let actorId: string;
let counter = 0;

function uniqueEmail() {
  counter += 1;
  return `admin-test-${Date.now()}-${counter}@planora.test`;
}

beforeAll(async () => {
  const [admin, developer] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: ROLES.ADMIN } }),
    prisma.role.findUniqueOrThrow({ where: { name: ROLES.DEVELOPER } }),
  ]);
  adminRoleId = admin.id;
  developerRoleId = developer.id;

  const actor = await prisma.user.create({
    data: {
      firstName: "Akter",
      lastName: "Admin",
      email: uniqueEmail(),
      roleId: adminRoleId,
      accountStatus: "ACTIVE",
    },
  });
  actorId = actor.id;
  createdUserIds.push(actor.id);
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

async function makeUser() {
  const result = await createUser(actorId, {
    firstName: "Novi",
    lastName: "Korisnik",
    email: uniqueEmail(),
    roleId: developerRoleId,
  });
  if (!result.ok) throw new Error(result.error);
  createdUserIds.push(result.data.id);
  return result.data.id;
}

describe("createUser", () => {
  it("creates an INACTIVE user without a password", async () => {
    const id = await makeUser();
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    expect(user.accountStatus).toBe("INACTIVE");
    expect(user.passwordHash).toBeNull();
    expect(user.createdById).toBe(actorId);
  });

  it("rejects a duplicate email", async () => {
    const email = uniqueEmail();
    const first = await createUser(actorId, {
      firstName: "A",
      lastName: "B",
      email,
      roleId: developerRoleId,
    });
    if (first.ok) createdUserIds.push(first.data.id);
    const second = await createUser(actorId, {
      firstName: "C",
      lastName: "D",
      email,
      roleId: developerRoleId,
    });
    expect(second.ok).toBe(false);
  });
});

describe("generateTemporaryCredentials", () => {
  it("activates the account and the temporary password can log in", async () => {
    const id = await makeUser();
    const result = await generateTemporaryCredentials(actorId, id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const temp = result.data.temporaryPassword;
    expect(temp).toMatch(/[A-Z]/);
    expect(temp).toMatch(/[a-z]/);
    expect(temp).toMatch(/[0-9]/);
    expect(temp.length).toBe(16);

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    expect(user.accountStatus).toBe("ACTIVE");
    expect(user.mustChangePassword).toBe(true);
    expect(user.passwordHash).not.toBeNull();

    const authorized = await verifyLoginCredentials(user.email, temp);
    expect(authorized).not.toBeNull();
  });

  it("resetting produces a new working password and invalidates the old one", async () => {
    const id = await makeUser();
    const first = await generateTemporaryCredentials(actorId, id);
    const second = await generateTemporaryCredentials(actorId, id);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.data.temporaryPassword).not.toBe(second.data.temporaryPassword);

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    expect(await verifyLoginCredentials(user.email, second.data.temporaryPassword)).not.toBeNull();
    expect(await verifyLoginCredentials(user.email, first.data.temporaryPassword)).toBeNull();
  });
});

describe("updateUser", () => {
  it("changes the role", async () => {
    const id = await makeUser();
    const result = await updateUser(actorId, id, {
      firstName: "Novi",
      lastName: "Korisnik",
      roleId: adminRoleId,
    });
    expect(result.ok).toBe(true);
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    expect(user.roleId).toBe(adminRoleId);
  });

  it("prevents an admin from removing their own admin role", async () => {
    const result = await updateUser(actorId, actorId, {
      firstName: "Akter",
      lastName: "Admin",
      roleId: developerRoleId,
    });
    expect(result.ok).toBe(false);
  });
});

describe("setUserBlocked", () => {
  it("prevents blocking your own account", async () => {
    const result = await setUserBlocked(actorId, actorId, true);
    expect(result.ok).toBe(false);
  });

  it("blocks and unblocks another account", async () => {
    const id = await makeUser();
    await generateTemporaryCredentials(actorId, id); // give it a password → unblock returns to ACTIVE

    const blocked = await setUserBlocked(actorId, id, true);
    expect(blocked.ok).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id } })).accountStatus).toBe("BLOCKED");

    const unblocked = await setUserBlocked(actorId, id, false);
    expect(unblocked.ok).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id } })).accountStatus).toBe("ACTIVE");
  });
});
