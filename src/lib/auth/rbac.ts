import { ROLES } from "@/lib/auth/constants";

// Roles allowed to manage teams, projects, tasks and labels.
const MANAGER_ROLES: string[] = [ROLES.ADMIN, ROLES.PROJECT_MANAGER];

export function canManage(role: string): boolean {
  return MANAGER_ROLES.includes(role);
}

/**
 * A user may change a task's status if they manage projects or are the task's
 * assignee.
 */
export function canUpdateTaskStatus(
  role: string,
  userId: string,
  assigneeId: string | null,
): boolean {
  return canManage(role) || assigneeId === userId;
}
