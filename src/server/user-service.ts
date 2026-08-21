import { AUDIT_ACTIONS, ROLES } from "@/lib/auth/constants";
import { recordAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { generateTemporaryPassword } from "@/lib/temp-password";
import type { ServiceResult } from "@/server/result";
import type { CreateUserInput, UpdateUserInput } from "@/validation/user";

// Fields safe to expose to the admin UI (never includes passwordHash).
const userListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  accountStatus: true,
  mustChangePassword: true,
  lastLoginAt: true,
  lockedUntil: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} as const;

export async function listUsers() {
  return prisma.user.findMany({
    select: userListSelect,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: userListSelect });
}

export async function listRoles() {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}

/** Create a user without a password. The account starts INACTIVE. */
export async function createUser(
  actorUserId: string,
  input: CreateUserInput,
): Promise<ServiceResult<{ id: string }>> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { ok: false, error: "Korisnik s ovom e-mail adresom već postoji." };
  }

  const role = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!role) {
    return { ok: false, error: "Odabrana uloga ne postoji." };
  }

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      roleId: input.roleId,
      accountStatus: "INACTIVE",
      mustChangePassword: false,
      createdById: actorUserId,
    },
  });

  await recordAudit({
    actorUserId,
    targetUserId: user.id,
    action: AUDIT_ACTIONS.USER_CREATED,
    metadata: { email: user.email, role: role.name },
  });

  return { ok: true, data: { id: user.id } };
}

/** Update a user's name and role. Audits role changes. */
export async function updateUser(
  actorUserId: string,
  targetUserId: string,
  input: UpdateUserInput,
): Promise<ServiceResult> {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { role: true },
  });
  if (!user) return { ok: false, error: "Korisnik ne postoji." };

  const newRole = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!newRole) return { ok: false, error: "Odabrana uloga ne postoji." };

  const roleChanged = user.roleId !== input.roleId;

  // Safety: an admin must not demote their own admin role (avoids self-lockout).
  if (
    roleChanged &&
    actorUserId === targetUserId &&
    user.role.name === ROLES.ADMIN &&
    newRole.name !== ROLES.ADMIN
  ) {
    return { ok: false, error: "Ne možete ukloniti vlastitu administratorsku ulogu." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { firstName: input.firstName, lastName: input.lastName, roleId: input.roleId },
  });

  if (roleChanged) {
    await recordAudit({
      actorUserId,
      targetUserId,
      action: AUDIT_ACTIONS.ROLE_CHANGED,
      metadata: { from: user.role.name, to: newRole.name },
    });
  }

  return { ok: true };
}

/**
 * Generate a temporary password for a user: activates an INACTIVE account or
 * resets the password of an existing one. Stores only the hash and returns the
 * plaintext to be shown to the administrator exactly once.
 */
export async function generateTemporaryCredentials(
  actorUserId: string,
  targetUserId: string,
): Promise<ServiceResult<{ temporaryPassword: string }>> {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) return { ok: false, error: "Korisnik ne postoji." };
  if (user.accountStatus === "BLOCKED") {
    return { ok: false, error: "Račun je blokiran. Prvo ga odblokirajte." };
  }

  const wasInactive = user.accountStatus === "INACTIVE";
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      passwordHash,
      accountStatus: "ACTIVE",
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  if (wasInactive) {
    await recordAudit({ actorUserId, targetUserId, action: AUDIT_ACTIONS.ACCOUNT_ACTIVATED });
  } else {
    await recordAudit({ actorUserId, targetUserId, action: AUDIT_ACTIONS.PASSWORD_RESET });
  }
  // Never include the temporary password itself in the audit metadata.
  await recordAudit({ actorUserId, targetUserId, action: AUDIT_ACTIONS.TEMP_PASSWORD_GENERATED });

  return { ok: true, data: { temporaryPassword } };
}

/** Block or unblock a user account. */
export async function setUserBlocked(
  actorUserId: string,
  targetUserId: string,
  blocked: boolean,
): Promise<ServiceResult> {
  if (actorUserId === targetUserId) {
    return { ok: false, error: "Ne možete blokirati vlastiti račun." };
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) return { ok: false, error: "Korisnik ne postoji." };

  if (blocked) {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { accountStatus: "BLOCKED" },
    });
    await recordAudit({ actorUserId, targetUserId, action: AUDIT_ACTIONS.ACCOUNT_BLOCKED });
  } else {
    // Unblocking returns the account to ACTIVE if it has a password, otherwise
    // INACTIVE (still awaiting its first temporary password).
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        accountStatus: user.passwordHash ? "ACTIVE" : "INACTIVE",
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    await recordAudit({ actorUserId, targetUserId, action: AUDIT_ACTIONS.ACCOUNT_UNBLOCKED });
  }

  return { ok: true };
}
