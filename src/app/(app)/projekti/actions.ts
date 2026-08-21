"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth/session";
import {
  assignTeam,
  createProject,
  deleteProject,
  unassignTeam,
  updateProject,
} from "@/server/project-service";
import { projectSchema } from "@/validation/project";

export type ProjectFormState = { error?: string; message?: string };

function parseProject(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireManager();
  const parsed = parseProject(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await createProject(parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/projekti");
  redirect(`/projekti/${result.data.id}`);
}

export async function updateProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireManager();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = parseProject(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravan unos." };

  const result = await updateProject(projectId, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/projekti/${projectId}`);
  revalidatePath("/projekti");
  return { message: "Spremljeno." };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireManager();
  const projectId = String(formData.get("projectId") ?? "");
  await deleteProject(projectId);
  revalidatePath("/projekti");
  redirect("/projekti");
}

export async function assignTeamAction(formData: FormData): Promise<void> {
  await requireManager();
  const projectId = String(formData.get("projectId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  if (teamId) await assignTeam(projectId, teamId);
  revalidatePath(`/projekti/${projectId}`);
}

export async function unassignTeamAction(formData: FormData): Promise<void> {
  await requireManager();
  const projectId = String(formData.get("projectId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  await unassignTeam(projectId, teamId);
  revalidatePath(`/projekti/${projectId}`);
}
