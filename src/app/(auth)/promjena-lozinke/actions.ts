"use server";

import { redirect } from "next/navigation";

import { unstable_update } from "@/auth";
import { requireUser } from "@/lib/auth/session";
import { changeUserPassword } from "@/server/auth-service";
import { changePasswordSchema } from "@/validation/auth";

export type ChangePasswordFormState = { error?: string };

export async function changePasswordAction(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const sessionUser = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };
  }

  const result = await changeUserPassword(
    sessionUser.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );
  if (!result.ok) {
    return { error: result.error };
  }

  // Reflect the cleared flag in the current session token immediately.
  await unstable_update({ mustChangePassword: false } as never);

  redirect("/dashboard");
}
