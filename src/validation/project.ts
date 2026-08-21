import { z } from "zod";

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, "Naziv je obavezan.").max(150),
    description: z.string().trim().min(1, "Opis je obavezan.").max(2000),
    startDate: z.coerce.date({ error: "Datum početka je obavezan." }),
    endDate: z.coerce.date().optional(),
  })
  .refine((d) => !d.endDate || d.endDate >= d.startDate, {
    message: "Datum završetka mora biti nakon datuma početka.",
    path: ["endDate"],
  });
export type ProjectInput = z.infer<typeof projectSchema>;
