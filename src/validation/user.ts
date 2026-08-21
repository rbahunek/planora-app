import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "Ime je obavezno.").max(100),
  lastName: z.string().trim().min(1, "Prezime je obavezno.").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Neispravna e-mail adresa.")),
  roleId: z.uuid("Odaberite ulogu."),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1, "Ime je obavezno.").max(100),
  lastName: z.string().trim().min(1, "Prezime je obavezno.").max(100),
  roleId: z.uuid("Odaberite ulogu."),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
