"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { createFeedback } from "@/server/feedback-service";
import { feedbackSchema } from "@/validation/feedback";

export type FeedbackFormState = { error?: string; message?: string };

export async function createFeedbackAction(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const user = await requireUser();

  const parsed = feedbackSchema.safeParse({
    text: formData.get("text"),
    rating: formData.get("rating") || undefined,
    attachmentUrl: formData.get("attachmentUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createFeedback(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/feedback");
  return { message: "Hvala na povratnoj informaciji!" };
}
