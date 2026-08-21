import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const now = new Date();

  const [activeProjects, inProgress, inReview, myMinutes, projectsRaw, myTasks, upcoming] =
    await Promise.all([
      prisma.project.count({ where: { OR: [{ endDate: null }, { endDate: { gte: now } }] } }),
      prisma.task.count({ where: { status: { name: "IN_PROGRESS" } } }),
      prisma.task.count({ where: { status: { name: "IN_REVIEW" } } }),
      prisma.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: { userId } }),
      prisma.project.findMany({
        orderBy: { startDate: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          endDate: true,
          tasks: { select: { status: { select: { name: true } } } },
        },
      }),
      prisma.task.findMany({
        where: { assigneeId: userId },
        orderBy: [{ dueDate: "asc" }, { priority: { sortOrder: "desc" } }],
        take: 6,
        include: {
          status: true,
          priority: true,
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.task.findMany({
        where: { dueDate: { gte: now }, status: { name: { not: "DONE" } } },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          status: true,
          priority: true,
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

  const projects = projectsRaw.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.status.name === "DONE").length;
    return {
      id: p.id,
      name: p.name,
      total,
      done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  return {
    stats: {
      activeProjects,
      inProgress,
      inReview,
      loggedHours: Math.round(((myMinutes._sum.durationMinutes ?? 0) / 60) * 10) / 10,
    },
    projects,
    myTasks,
    upcoming,
  };
}
