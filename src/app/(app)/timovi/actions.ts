"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth/session";
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  removeTeamMember,
  updateTeam,
} from "@/server/team-service";
import { teamSchema } from "@/validation/team";

export type TeamFormState = { error?: string; message?: string };

function parseTeam(formData: FormData) {
  return teamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
}

export async function createTeamAction(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  await requireManager();
  const parsed = parseTeam(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createTeam(parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/timovi");
  redirect(`/timovi/${result.data.id}`);
}

export async function updateTeamAction(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  await requireManager();
  const teamId = String(formData.get("teamId") ?? "");
  const parsed = parseTeam(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await updateTeam(teamId, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/timovi/${teamId}`);
  revalidatePath("/timovi");
  return { message: "Spremljeno." };
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  await requireManager();
  const teamId = String(formData.get("teamId") ?? "");
  await deleteTeam(teamId);
  revalidatePath("/timovi");
  redirect("/timovi");
}

export async function addMemberAction(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  await requireManager();
  const teamId = String(formData.get("teamId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Odaberite korisnika." };

  const result = await addTeamMember(teamId, userId);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/timovi/${teamId}`);
  return { message: "Član je dodan." };
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  await requireManager();
  const teamId = String(formData.get("teamId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  await removeTeamMember(teamId, userId);
  revalidatePath(`/timovi/${teamId}`);
}
