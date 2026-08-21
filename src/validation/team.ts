import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().trim().min(1, "Naziv je obavezan.").max(150),
  description: z.string().trim().max(1000).optional(),
});
export type TeamInput = z.infer<typeof teamSchema>;
