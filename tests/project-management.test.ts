import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ROLES } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { createLabel, deleteLabel, listLabels } from "@/server/label-service";
import {
  assignTeam,
  createProject,
  listAssignableTeams,
  updateProject,
} from "@/server/project-service";
import {
  createTask,
  deleteTask,
  listProjectAssignees,
  listPriorities,
  listStatuses,
  listTasks,
  setTaskStatus,
  updateTask,
} from "@/server/task-service";
import {
  addTeamMember,
  createTeam,
  getTeam,
  listAssignableUsers,
  removeTeamMember,
} from "@/server/team-service";

const projectIds: string[] = [];
const teamIds: string[] = [];
const labelIds: string[] = [];
const userIds: string[] = [];
let creatorId: string;
let memberId: string;
let counter = 0;

const uniqueEmail = () => `pm-test-${Date.now()}-${(counter += 1)}@planora.test`;

async function makeUser(role: string) {
  const r = await prisma.role.findUniqueOrThrow({ where: { name: role } });
  const u = await prisma.user.create({
    data: {
      firstName: "T",
      lastName: "U",
      email: uniqueEmail(),
      roleId: r.id,
      accountStatus: "ACTIVE",
    },
  });
  userIds.push(u.id);
  return u.id;
}

async function makeProject() {
  const res = await createProject({
    name: `Projekt ${counter}`,
    description: "Opis",
    startDate: new Date("2026-01-01"),
  });
  if (!res.ok) throw new Error(res.error);
  projectIds.push(res.data.id);
  return res.data.id;
}

async function makeTeam() {
  const res = await createTeam({ name: `Tim ${counter}` });
  if (!res.ok) throw new Error(res.error);
  teamIds.push(res.data.id);
  return res.data.id;
}

beforeAll(async () => {
  creatorId = await makeUser(ROLES.PROJECT_MANAGER);
  memberId = await makeUser(ROLES.DEVELOPER);
});

afterAll(async () => {
  // Delete projects first (cascades tasks) so createdById Restrict does not block user deletes.
  await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
  await prisma.team.deleteMany({ where: { id: { in: teamIds } } });
  await prisma.label.deleteMany({ where: { id: { in: labelIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe("teams", () => {
  it("creates a team, adds and removes a member", async () => {
    const teamId = await makeTeam();

    const assignableBefore = await listAssignableUsers(teamId);
    expect(assignableBefore.some((u) => u.id === memberId)).toBe(true);

    expect((await addTeamMember(teamId, memberId)).ok).toBe(true);
    const team = await getTeam(teamId);
    expect(team?.members.some((m) => m.user.id === memberId)).toBe(true);

    const assignableAfter = await listAssignableUsers(teamId);
    expect(assignableAfter.some((u) => u.id === memberId)).toBe(false);

    expect((await removeTeamMember(teamId, memberId)).ok).toBe(true);
    const team2 = await getTeam(teamId);
    expect(team2?.members.length).toBe(0);
  });
});

describe("projects", () => {
  it("creates, updates and assigns a team", async () => {
    const projectId = await makeProject();
    const teamId = await makeTeam();

    expect(
      (
        await updateProject(projectId, {
          name: "Novi naziv",
          description: "Novi opis",
          startDate: new Date("2026-02-01"),
          endDate: new Date("2026-06-01"),
        })
      ).ok,
    ).toBe(true);

    const assignableTeams = await listAssignableTeams(projectId);
    expect(assignableTeams.some((t) => t.id === teamId)).toBe(true);

    expect((await assignTeam(projectId, teamId)).ok).toBe(true);
    const assignableAfter = await listAssignableTeams(projectId);
    expect(assignableAfter.some((t) => t.id === teamId)).toBe(false);
  });

  it("lists project assignees from assigned teams' members", async () => {
    const projectId = await makeProject();
    const teamId = await makeTeam();
    await addTeamMember(teamId, memberId);
    await assignTeam(projectId, teamId);

    const assignees = await listProjectAssignees(projectId);
    expect(assignees.some((u) => u.id === memberId)).toBe(true);
  });
});

describe("tasks", () => {
  it("creates a task with labels, updates status and filters", async () => {
    const projectId = await makeProject();
    const statuses = await listStatuses();
    const priorities = await listPriorities();
    const todo = statuses.find((s) => s.name === "TODO")!;
    const done = statuses.find((s) => s.name === "DONE")!;
    const high = priorities.find((p) => p.name === "HIGH")!;

    const labelRes = await createLabel({ name: `oznaka-${counter}`, color: "#3366ff" });
    if (!labelRes.ok) throw new Error(labelRes.error);
    labelIds.push(labelRes.data.id);

    const created = await createTask(projectId, creatorId, {
      name: "Zadatak 1",
      description: "Opis zadatka",
      statusId: todo.id,
      priorityId: high.id,
      assigneeId: memberId,
      labelIds: [labelRes.data.id],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const all = await listTasks(projectId);
    expect(all.length).toBe(1);
    expect(all[0].labels.length).toBe(1);
    expect(all[0].assignee?.id).toBe(memberId);

    // Filter by status: TODO returns it, DONE does not.
    expect((await listTasks(projectId, { statusId: todo.id })).length).toBe(1);
    expect((await listTasks(projectId, { statusId: done.id })).length).toBe(0);

    // Filter by label.
    expect((await listTasks(projectId, { labelId: labelRes.data.id })).length).toBe(1);

    // Status-only update.
    expect((await setTaskStatus(created.data.id, done.id)).ok).toBe(true);
    expect((await listTasks(projectId, { statusId: done.id })).length).toBe(1);

    // Full update replaces labels (clear them).
    expect(
      (
        await updateTask(created.data.id, {
          name: "Zadatak 1b",
          description: "Novi opis",
          statusId: done.id,
          priorityId: high.id,
          labelIds: [],
        })
      ).ok,
    ).toBe(true);
    const afterUpdate = await listTasks(projectId);
    expect(afterUpdate[0].labels.length).toBe(0);
    expect(afterUpdate[0].name).toBe("Zadatak 1b");

    expect((await deleteTask(created.data.id)).ok).toBe(true);
    expect((await listTasks(projectId)).length).toBe(0);
  });
});

describe("labels", () => {
  it("creates a label, rejects duplicates, and deletes it", async () => {
    const name = `dup-${Date.now()}`;
    const first = await createLabel({ name });
    if (!first.ok) throw new Error(first.error);
    labelIds.push(first.data.id);

    expect((await createLabel({ name })).ok).toBe(false);

    const all = await listLabels();
    expect(all.some((l) => l.id === first.data.id)).toBe(true);

    expect((await deleteLabel(first.data.id)).ok).toBe(true);
  });
});
