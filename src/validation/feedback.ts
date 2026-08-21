import { z } from "zod";

export const feedbackSchema = z.object({
  text: z.string().trim().min(1, "Tekst je obavezan.").max(2000),
  // Rating is optional; when present it must be between 1 and 5.
  rating: z.coerce.number().int().min(1, "Ocjena mora biti između 1 i 5.").max(5).optional(),
  // Optional attachment URL (metadata only — no file upload until a storage
  // provider is chosen). Must be a valid http(s) URL when present.
  attachmentUrl: z.url("Neispravan URL privitka.").optional(),
});
export type FeedbackInput = z.infer<typeof feedbackSchema>;
