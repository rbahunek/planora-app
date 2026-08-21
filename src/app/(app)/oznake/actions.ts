"use server";

import { revalidatePath } from "next/cache";

import { requireManager } from "@/lib/auth/session";
import { createLabel, deleteLabel } from "@/server/label-service";
import { labelSchema } from "@/validation/label";

export type LabelFormState = { error?: string; message?: string };

export async function createLabelAction(
  _prev: LabelFormState,
  formData: FormData,
): Promise<LabelFormState> {
  await requireManager();
  const parsed = labelSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createLabel(parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/oznake");
  return { message: "Oznaka je kreirana." };
}

export async function deleteLabelAction(formData: FormData): Promise<void> {
  await requireManager();
  const labelId = String(formData.get("labelId") ?? "");
  await deleteLabel(labelId);
  revalidatePath("/oznake");
}
