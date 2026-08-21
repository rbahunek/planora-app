import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { TeamInput } from "@/validation/team";

export async function listTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { members: true, projects: true } } },
  });
}

export async function getTeam(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { user: { lastName: "asc" } },
      },
    },
  });
}

export async function createTeam(input: TeamInput): Promise<ServiceResult<{ id: string }>> {
  const team = await prisma.team.create({
    data: { name: input.name, description: input.description ?? null },
  });
  return { ok: true, data: { id: team.id } };
}

export async function updateTeam(id: string, input: TeamInput): Promise<ServiceResult> {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return { ok: false, error: "Tim ne postoji." };
  await prisma.team.update({
    where: { id },
    data: { name: input.name, description: input.description ?? null },
  });
  return { ok: true };
}

export async function deleteTeam(id: string): Promise<ServiceResult> {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return { ok: false, error: "Tim ne postoji." };
  await prisma.team.delete({ where: { id } });
  return { ok: true };
}

/** Users not already in the team, for the "add member" picker. */
export async function listAssignableUsers(teamId: string) {
  const members = await prisma.userTeam.findMany({
    where: { teamId },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);
  return prisma.user.findMany({
    where: { id: { notIn: memberIds }, accountStatus: { not: "BLOCKED" } },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function addTeamMember(teamId: string, userId: string): Promise<ServiceResult> {
  const [team, user] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!team || !user) return { ok: false, error: "Tim ili korisnik ne postoji." };

  await prisma.userTeam.upsert({
    where: { userId_teamId: { userId, teamId } },
    update: {},
    create: { userId, teamId },
  });
  return { ok: true };
}

export async function removeTeamMember(teamId: string, userId: string): Promise<ServiceResult> {
  await prisma.userTeam.deleteMany({ where: { teamId, userId } });
  return { ok: true };
}
