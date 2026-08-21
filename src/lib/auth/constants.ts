// Role names must match the seeded Role.name values.
export const ROLES = {
  ADMIN: "ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  DEVELOPER: "DEVELOPER",
  TESTER: "TESTER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// Account lockout policy.
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_MINUTES = 15;

// Audit log action identifiers.
export const AUDIT_ACTIONS = {
  USER_CREATED: "USER_CREATED",
  ACCOUNT_ACTIVATED: "ACCOUNT_ACTIVATED",
  TEMP_PASSWORD_GENERATED: "TEMP_PASSWORD_GENERATED",
  PASSWORD_RESET: "PASSWORD_RESET",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  ROLE_CHANGED: "ROLE_CHANGED",
  ACCOUNT_BLOCKED: "ACCOUNT_BLOCKED",
  ACCOUNT_UNBLOCKED: "ACCOUNT_UNBLOCKED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// A valid argon2id hash of a throwaway string. Used to normalize verification
// timing when a user does not exist / has no password, mitigating account
// enumeration via response-time differences.
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$44w1eUc7dTEyKfRCtApabw$ARB+GnkoMPSz89RmRsl1x5so3SjGxReR3YFwKCpza9g";
