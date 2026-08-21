import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { FeedbackInput } from "@/validation/feedback";

export async function createFeedback(
  userId: string,
  input: FeedbackInput,
): Promise<ServiceResult<{ id: string }>> {
  const feedback = await prisma.feedback.create({
    data: {
      userId,
      text: input.text,
      rating: input.rating ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
    },
  });
  return { ok: true, data: { id: feedback.id } };
}

export async function listUserFeedback(userId: string) {
  return prisma.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/** All feedback with author info — admin-only view. */
export async function listAllFeedback() {
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });
}
