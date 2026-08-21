"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/session";
import {
  createUser,
  generateTemporaryCredentials,
  setUserBlocked,
  updateUser,
} from "@/server/user-service";
import { createUserSchema, updateUserSchema } from "@/validation/user";

export type CreateUserFormState = { error?: string };
export type UpdateUserFormState = { error?: string; message?: string };
export type CredentialsFormState = { error?: string; temporaryPassword?: string };
export type BlockFormState = { error?: string; message?: string };

export async function createUserAction(
  _prev: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  const admin = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };
  }

  const result = await createUser(admin.id, parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/korisnici");
  redirect(`/admin/korisnici/${result.data.id}`);
}

export async function updateUserAction(
  _prev: UpdateUserFormState,
  formData: FormData,
): Promise<UpdateUserFormState> {
  const admin = await requireAdmin();
  const targetUserId = String(formData.get("userId") ?? "");

  const parsed = updateUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };
  }

  const result = await updateUser(admin.id, targetUserId, parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/admin/korisnici/${targetUserId}`);
  revalidatePath("/admin/korisnici");
  return { message: "Podaci su spremljeni." };
}

export async function generateCredentialsAction(
  _prev: CredentialsFormState,
  formData: FormData,
): Promise<CredentialsFormState> {
  const admin = await requireAdmin();
  const targetUserId = String(formData.get("userId") ?? "");

  const result = await generateTemporaryCredentials(admin.id, targetUserId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/admin/korisnici/${targetUserId}`);
  revalidatePath("/admin/korisnici");
  return { temporaryPassword: result.data.temporaryPassword };
}

export async function toggleBlockAction(
  _prev: BlockFormState,
  formData: FormData,
): Promise<BlockFormState> {
  const admin = await requireAdmin();
  const targetUserId = String(formData.get("userId") ?? "");
  const blocked = formData.get("blocked") === "true";

  const result = await setUserBlocked(admin.id, targetUserId, blocked);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/admin/korisnici/${targetUserId}`);
  revalidatePath("/admin/korisnici");
  return { message: blocked ? "Račun je blokiran." : "Račun je odblokiran." };
}
