import { prisma } from "@/lib/prisma";
import type { ServiceResult } from "@/server/result";
import type { LabelInput } from "@/validation/label";

export async function listLabels() {
  return prisma.label.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function createLabel(input: LabelInput): Promise<ServiceResult<{ id: string }>> {
  const existing = await prisma.label.findUnique({ where: { name: input.name } });
  if (existing) return { ok: false, error: "Oznaka s ovim nazivom već postoji." };

  const label = await prisma.label.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
    },
  });
  return { ok: true, data: { id: label.id } };
}

export async function deleteLabel(id: string): Promise<ServiceResult> {
  const label = await prisma.label.findUnique({ where: { id } });
  if (!label) return { ok: false, error: "Oznaka ne postoji." };
  await prisma.label.delete({ where: { id } });
  return { ok: true };
}
