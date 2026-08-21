import { z } from "zod";

export const taskSchema = z
  .object({
    name: z.string().trim().min(1, "Naziv je obavezan.").max(200),
    description: z.string().trim().min(1, "Opis je obavezan.").max(4000),
    statusId: z.uuid("Odaberite status."),
    priorityId: z.uuid("Odaberite prioritet."),
    assigneeId: z.uuid().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    labelIds: z.array(z.uuid()).default([]),
  })
  .refine((d) => !d.startDate || !d.dueDate || d.dueDate >= d.startDate, {
    message: "Rok mora biti nakon datuma početka.",
    path: ["dueDate"],
  });
export type TaskInput = z.infer<typeof taskSchema>;

// Status-only update (used by assignees who may not edit the whole task).
export const taskStatusSchema = z.object({
  statusId: z.uuid("Odaberite status."),
});
