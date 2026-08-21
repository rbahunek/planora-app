import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { ProjectInput } from "@/validation/project";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { tasks: true, teams: true } } },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      teams: { include: { team: { select: { id: true, name: true } } } },
    },
  });
}

export async function createProject(input: ProjectInput): Promise<ServiceResult<{ id: string }>> {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    },
  });
  return { ok: true, data: { id: project.id } };
}

export async function updateProject(id: string, input: ProjectInput): Promise<ServiceResult> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { ok: false, error: "Projekt ne postoji." };
  await prisma.project.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    },
  });
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ServiceResult> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { ok: false, error: "Projekt ne postoji." };
  await prisma.project.delete({ where: { id } });
  return { ok: true };
}

export async function listAssignableTeams(projectId: string) {
  const assigned = await prisma.projectTeam.findMany({
    where: { projectId },
    select: { teamId: true },
  });
  const assignedIds = assigned.map((a) => a.teamId);
  return prisma.team.findMany({
    where: { id: { notIn: assignedIds } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function assignTeam(projectId: string, teamId: string): Promise<ServiceResult> {
  const [project, team] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.team.findUnique({ where: { id: teamId } }),
  ]);
  if (!project || !team) return { ok: false, error: "Projekt ili tim ne postoji." };

  await prisma.projectTeam.upsert({
    where: { projectId_teamId: { projectId, teamId } },
    update: {},
    create: { projectId, teamId },
  });
  return { ok: true };
}

export async function unassignTeam(projectId: string, teamId: string): Promise<ServiceResult> {
  await prisma.projectTeam.deleteMany({ where: { projectId, teamId } });
  return { ok: true };
}
