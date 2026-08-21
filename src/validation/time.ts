import { z } from "zod";

const timeOfDay = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:MM 24h
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const timeEntrySchema = z.object({
  entryDate: z.string().regex(isoDate, "Neispravan datum."),
  startTime: z.string().regex(timeOfDay, "Neispravno vrijeme početka (HH:MM)."),
  endTime: z.string().regex(timeOfDay, "Neispravno vrijeme završetka (HH:MM)."),
  description: z.string().trim().max(1000).optional(),
});
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
