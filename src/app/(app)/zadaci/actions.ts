"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canUpdateTaskStatus } from "@/lib/auth/rbac";
import { requireManager, requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createTask, deleteTask, setTaskStatus, updateTask } from "@/server/task-service";
import { taskSchema, taskStatusSchema } from "@/validation/task";

export type TaskFormState = { error?: string; message?: string };

function parseTask(formData: FormData) {
  return taskSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    statusId: formData.get("statusId"),
    priorityId: formData.get("priorityId"),
    assigneeId: formData.get("assigneeId") || undefined,
    startDate: formData.get("startDate") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    labelIds: formData.getAll("labelIds").map(String),
  });
}

export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const manager = await requireManager();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = parseTask(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createTask(projectId, manager.id, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/projekti/${projectId}`);
  redirect(`/zadaci/${result.data.id}`);
}

export async function updateTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requireManager();
  const taskId = String(formData.get("taskId") ?? "");
  const parsed = parseTask(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await updateTask(taskId, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/zadaci/${taskId}`);
  return { message: "Spremljeno." };
}

export async function setStatusAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");

  const parsed = taskStatusSchema.safeParse({ statusId: formData.get("statusId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assigneeId: true },
  });
  if (!task) return { error: "Zadatak ne postoji." };

  if (!canUpdateTaskStatus(user.role, user.id, task.assigneeId)) {
    return { error: "Nemate ovlast za promjenu statusa ovog zadatka." };
  }

  const result = await setTaskStatus(taskId, parsed.data.statusId);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/zadaci/${taskId}`);
  return { message: "Status je ažuriran." };
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  await requireManager();
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  await deleteTask(taskId);
  revalidatePath(`/projekti/${projectId}`);
  redirect(`/projekti/${projectId}`);
}
