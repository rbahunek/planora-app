import { z } from "zod";

export const labelSchema = z.object({
  name: z.string().trim().min(1, "Naziv je obavezan.").max(100),
  description: z.string().trim().max(500).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Boja mora biti u obliku #RRGGBB.")
    .optional(),
});
export type LabelInput = z.infer<typeof labelSchema>;
