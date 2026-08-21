import { prisma } from "@/lib/prisma";

const auditUserSelect = { firstName: true, lastName: true, email: true } as const;

/** List the most recent audit log entries (admin-only view). */
export async function listAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: auditUserSelect },
      target: { select: auditUserSelect },
    },
  });
}
