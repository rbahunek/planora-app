import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES, type RoleName } from "@/lib/auth/constants";

export type SessionUser = {
  id: string;
  role: string;
  mustChangePassword: boolean;
  name?: string | null;
  email?: string | null;
};

/** Returns the current session user, or null if not authenticated. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/** Requires an authenticated user; redirects to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires an authenticated user with one of the given roles; redirects to
 * /dashboard otherwise. Server-side authorization guard.
 */
export async function requireRole(...roles: RoleName[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role as RoleName)) redirect("/dashboard");
  return user;
}

/** Requires an ADMIN user. */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(ROLES.ADMIN);
}

/** Requires a user who can manage teams/projects/tasks (ADMIN or PROJECT_MANAGER). */
export async function requireManager(): Promise<SessionUser> {
  return requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
}
