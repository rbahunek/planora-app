import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { TaskInput } from "@/validation/task";

export async function listStatuses() {
  return prisma.status.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listPriorities() {
  return prisma.priority.findMany({ orderBy: { sortOrder: "asc" } });
}

export type TaskFilters = {
  statusId?: string;
  priorityId?: string;
  assigneeId?: string;
  labelId?: string;
};

export async function listTasks(projectId: string, filters: TaskFilters = {}) {
  return prisma.task.findMany({
    where: {
      projectId,
      statusId: filters.statusId,
      priorityId: filters.priorityId,
      assigneeId: filters.assigneeId,
      labels: filters.labelId ? { some: { labelId: filters.labelId } } : undefined,
    },
    orderBy: [{ priority: { sortOrder: "desc" } }, { createdAt: "desc" }],
    include: {
      status: true,
      priority: true,
      assignee: { select: { id: true, firstName: true, lastName: true } },
      labels: { include: { label: true } },
    },
  });
}

/** Tasks assigned to a specific user (across projects), for the "Zadaci" overview. */
export async function listTasksAssignedTo(userId: string) {
  return prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: [{ dueDate: "asc" }, { priority: { sortOrder: "desc" } }],
    include: {
      status: true,
      priority: true,
      project: { select: { id: true, name: true } },
      labels: { include: { label: true } },
    },
  });
}

export async function getTask(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      status: true,
      priority: true,
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      labels: { include: { label: true } },
    },
  });
}

/** Active users that can be assigned to a task (members of the project's teams). */
export async function listProjectAssignees(projectId: string) {
  const memberships = await prisma.userTeam.findMany({
    where: {
      team: { projects: { some: { projectId } } },
      user: { accountStatus: "ACTIVE" },
    },
    select: { user: { select: { id: true, firstName: true, lastName: true } } },
    distinct: ["userId"],
    orderBy: { user: { lastName: "asc" } },
  });
  return memberships.map((m) => m.user);
}

async function referenceExists(input: TaskInput): Promise<string | null> {
  const [status, priority] = await Promise.all([
    prisma.status.findUnique({ where: { id: input.statusId } }),
    prisma.priority.findUnique({ where: { id: input.priorityId } }),
  ]);
  if (!status) return "Odabrani status ne postoji.";
  if (!priority) return "Odabrani prioritet ne postoji.";
  return null;
}

export async function createTask(
  projectId: string,
  createdById: string,
  input: TaskInput,
): Promise<ServiceResult<{ id: string }>> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: "Projekt ne postoji." };

  const refError = await referenceExists(input);
  if (refError) return { ok: false, error: refError };

  const task = await prisma.task.create({
    data: {
      name: input.name,
      description: input.description,
      statusId: input.statusId,
      priorityId: input.priorityId,
      projectId,
      createdById,
      assigneeId: input.assigneeId ?? null,
      startDate: input.startDate ?? null,
      dueDate: input.dueDate ?? null,
      labels: { create: input.labelIds.map((labelId) => ({ labelId })) },
    },
  });
  return { ok: true, data: { id: task.id } };
}

export async function updateTask(id: string, input: TaskInput): Promise<ServiceResult> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return { ok: false, error: "Zadatak ne postoji." };

  const refError = await referenceExists(input);
  if (refError) return { ok: false, error: refError };

  await prisma.$transaction([
    prisma.taskLabel.deleteMany({ where: { taskId: id } }),
    prisma.task.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        statusId: input.statusId,
        priorityId: input.priorityId,
        assigneeId: input.assigneeId ?? null,
        startDate: input.startDate ?? null,
        dueDate: input.dueDate ?? null,
        labels: { create: input.labelIds.map((labelId) => ({ labelId })) },
      },
    }),
  ]);
  return { ok: true };
}

export async function setTaskStatus(id: string, statusId: string): Promise<ServiceResult> {
  const [task, status] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.status.findUnique({ where: { id: statusId } }),
  ]);
  if (!task) return { ok: false, error: "Zadatak ne postoji." };
  if (!status) return { ok: false, error: "Status ne postoji." };
  await prisma.task.update({ where: { id }, data: { statusId } });
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ServiceResult> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return { ok: false, error: "Zadatak ne postoji." };
  await prisma.task.delete({ where: { id } });
  return { ok: true };
}
