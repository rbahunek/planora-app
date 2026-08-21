import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";

type AuditMetadata = Prisma.InputJsonValue;

/**
 * Record a security-relevant event in the audit log.
 *
 * SECURITY: never pass passwords, temporary passwords, password hashes, or
 * session values in `metadata`.
 */
export async function recordAudit(params: {
  actorUserId: string;
  action: AuditAction;
  targetUserId?: string | null;
  metadata?: AuditMetadata | null;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      targetUserId: params.targetUserId ?? null,
      action: params.action,
      metadata: params.metadata ?? undefined,
    },
  });
}
