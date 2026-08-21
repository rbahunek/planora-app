"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { createTimeEntry, deleteTimeEntry } from "@/server/time-service";
import { timeEntrySchema } from "@/validation/time";

export type TimeEntryFormState = { error?: string; message?: string };

export async function createTimeEntryAction(
  _prev: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");

  const parsed = timeEntrySchema.safeParse({
    entryDate: formData.get("entryDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createTimeEntry(user.id, taskId, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/zadaci/${taskId}`);
  revalidatePath("/vrijeme");
  return { message: "Vrijeme je evidentirano." };
}

export async function deleteTimeEntryAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  await deleteTimeEntry(user.id, entryId);
  if (taskId) revalidatePath(`/zadaci/${taskId}`);
  revalidatePath("/vrijeme");
}
