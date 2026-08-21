import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { TimeEntryInput } from "@/validation/time";

/**
 * Create a time entry for a user on a task. The duration is computed on the
 * server from start/end times — a client-provided duration is never trusted.
 */
export async function createTimeEntry(
  userId: string,
  taskId: string,
  input: TimeEntryInput,
): Promise<ServiceResult<{ id: string }>> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { ok: false, error: "Zadatak ne postoji." };

  const start = new Date(`${input.entryDate}T${input.startTime}:00`);
  const end = new Date(`${input.entryDate}T${input.endTime}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: "Neispravan datum ili vrijeme." };
  }
  if (end <= start) {
    return { ok: false, error: "Vrijeme završetka mora biti nakon vremena početka." };
  }

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);

  const entry = await prisma.timeEntry.create({
    data: {
      userId,
      taskId,
      entryDate: new Date(`${input.entryDate}T00:00:00`),
      startTime: start,
      endTime: end,
      durationMinutes,
      description: input.description ?? null,
    },
  });
  return { ok: true, data: { id: entry.id } };
}

export async function listUserTimeEntries(userId: string) {
  return prisma.timeEntry.findMany({
    where: { userId },
    orderBy: [{ entryDate: "desc" }, { startTime: "desc" }],
    include: {
      task: { select: { id: true, name: true, project: { select: { id: true, name: true } } } },
    },
  });
}

export async function listTaskTimeEntriesForUser(taskId: string, userId: string) {
  return prisma.timeEntry.findMany({
    where: { taskId, userId },
    orderBy: [{ entryDate: "desc" }, { startTime: "desc" }],
  });
}

/** Delete a time entry — only the owner may delete their own entry. */
export async function deleteTimeEntry(userId: string, entryId: string): Promise<ServiceResult> {
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });
  if (!entry) return { ok: false, error: "Unos ne postoji." };
  if (entry.userId !== userId) return { ok: false, error: "Nemate ovlast za brisanje ovog unosa." };
  await prisma.timeEntry.delete({ where: { id: entryId } });
  return { ok: true };
}
