import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ROLES } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";
import { createFeedback, listUserFeedback } from "@/server/feedback-service";
import { createTimeEntry, deleteTimeEntry, listUserTimeEntries } from "@/server/time-service";
import { feedbackSchema } from "@/validation/feedback";

const userIds: string[] = [];
const projectIds: string[] = [];
let userId: string;
let otherUserId: string;
let taskId: string;
let counter = 0;

const uniqueEmail = () => `tf-test-${Date.now()}-${(counter += 1)}@planora.test`;

async function makeUser() {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: ROLES.DEVELOPER } });
  const u = await prisma.user.create({
    data: {
      firstName: "T",
      lastName: "U",
      email: uniqueEmail(),
      roleId: role.id,
      accountStatus: "ACTIVE",
    },
  });
  userIds.push(u.id);
  return u.id;
}

beforeAll(async () => {
  userId = await makeUser();
  otherUserId = await makeUser();

  const [status, priority] = await Promise.all([
    prisma.status.findFirstOrThrow({ where: { name: "TODO" } }),
    prisma.priority.findFirstOrThrow({ where: { name: "MEDIUM" } }),
  ]);
  const project = await prisma.project.create({
    data: { name: "TF Projekt", description: "x", startDate: new Date("2026-01-01") },
  });
  projectIds.push(project.id);
  const task = await prisma.task.create({
    data: {
      name: "TF Zadatak",
      description: "x",
      statusId: status.id,
      priorityId: priority.id,
      projectId: project.id,
      createdById: userId,
    },
  });
  taskId = task.id;
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe("time entries", () => {
  it("computes duration on the server", async () => {
    const res = await createTimeEntry(userId, taskId, {
      entryDate: "2026-08-21",
      startTime: "09:00",
      endTime: "10:30",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const entry = await prisma.timeEntry.findUniqueOrThrow({ where: { id: res.data.id } });
    expect(entry.durationMinutes).toBe(90);
  });

  it("rejects an end time that is not after the start time", async () => {
    const res = await createTimeEntry(userId, taskId, {
      entryDate: "2026-08-21",
      startTime: "10:00",
      endTime: "10:00",
    });
    expect(res.ok).toBe(false);
  });

  it("lists the user's entries", async () => {
    const entries = await listUserTimeEntries(userId);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].task.id).toBe(taskId);
  });

  it("only lets the owner delete an entry", async () => {
    const created = await createTimeEntry(userId, taskId, {
      entryDate: "2026-08-22",
      startTime: "08:00",
      endTime: "09:00",
    });
    if (!created.ok) throw new Error("setup failed");

    expect((await deleteTimeEntry(otherUserId, created.data.id)).ok).toBe(false);
    expect((await deleteTimeEntry(userId, created.data.id)).ok).toBe(true);
  });
});

describe("feedback", () => {
  it("validates the rating range", () => {
    expect(feedbackSchema.safeParse({ text: "ok", rating: 3 }).success).toBe(true);
    expect(feedbackSchema.safeParse({ text: "ok", rating: 6 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ text: "ok" }).success).toBe(true); // rating optional
    expect(feedbackSchema.safeParse({ text: "ok", attachmentUrl: "not-a-url" }).success).toBe(
      false,
    );
  });

  it("creates and lists feedback", async () => {
    const res = await createFeedback(userId, { text: "Odlična aplikacija", rating: 5 });
    expect(res.ok).toBe(true);

    const list = await listUserFeedback(userId);
    expect(list.some((f) => f.text === "Odlična aplikacija" && f.rating === 5)).toBe(true);
  });
});
