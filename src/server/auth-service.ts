import {
  ACCOUNT_LOCK_MINUTES,
  AUDIT_ACTIONS,
  DUMMY_PASSWORD_HASH,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from "@/lib/auth/constants";
import { recordAudit } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
};

/**
 * Verify email/password credentials and apply the account-security policy
 * (blocked/inactive rejection, temporary lockout, failed-attempt counting).
 * Returns the authorized user on success, or null on any failure — the caller
 * must not reveal which check failed.
 *
 * `email` is expected to be already normalized (trimmed + lowercased).
 */
export async function verifyLoginCredentials(
  email: string,
  password: string,
): Promise<AuthorizedUser | null> {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // Normalize timing to mitigate account enumeration.
  if (!user || !user.passwordHash) {
    await verifyPassword(DUMMY_PASSWORD_HASH, password);
    return null;
  }

  // Reject blocked or not-yet-active accounts.
  if (user.accountStatus !== "ACTIVE") {
    await verifyPassword(DUMMY_PASSWORD_HASH, password);
    return null;
  }

  // Reject while temporarily locked.
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await verifyPassword(DUMMY_PASSWORD_HASH, password);
    return null;
  }

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60_000)
          : user.lockedUntil,
      },
    });
    await recordAudit({
      actorUserId: user.id,
      action: shouldLock ? AUDIT_ACTIONS.ACCOUNT_LOCKED : AUDIT_ACTIONS.LOGIN_FAILED,
      metadata: { failedLoginAttempts: attempts },
    });
    return null;
  }

  // Successful login: reset counters, stamp last login, audit.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await recordAudit({ actorUserId: user.id, action: AUDIT_ACTIONS.LOGIN_SUCCESS });

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role.name,
    mustChangePassword: user.mustChangePassword,
  };
}

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Change a user's password after verifying the current one. Clears the
 * `mustChangePassword` flag and writes an audit entry. `newPassword` is
 * expected to already satisfy the strength policy (validated by the caller).
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    return { ok: false, error: "Korisnički račun nije dostupan." };
  }

  const currentValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!currentValid) {
    return { ok: false, error: "Trenutna lozinka nije ispravna." };
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });
  await recordAudit({ actorUserId: user.id, action: AUDIT_ACTIONS.PASSWORD_CHANGED });

  return { ok: true };
}
