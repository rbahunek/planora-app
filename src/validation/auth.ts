import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Neispravna e-mail adresa.")),
  password: z.string().min(1, "Lozinka je obavezna."),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Reasonable password-strength policy for new/changed passwords.
export const strongPasswordSchema = z
  .string()
  .min(10, "Lozinka mora imati barem 10 znakova.")
  .max(200, "Lozinka je predugačka.")
  .regex(/[a-z]/, "Lozinka mora sadržavati barem jedno malo slovo.")
  .regex(/[A-Z]/, "Lozinka mora sadržavati barem jedno veliko slovo.")
  .regex(/[0-9]/, "Lozinka mora sadržavati barem jednu znamenku.");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Trenutna lozinka je obavezna."),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Potvrda lozinke je obavezna."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Nova lozinka i potvrda se ne podudaraju.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Nova lozinka mora se razlikovati od trenutne.",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
