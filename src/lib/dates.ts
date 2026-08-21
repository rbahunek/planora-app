const dateFormatter = new Intl.DateTimeFormat("hr-HR", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("hr-HR", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Format a Date for a native <input type="date"> (YYYY-MM-DD, local time). */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(date: Date | null | undefined): string {
  return date ? dateFormatter.format(date) : "—";
}

export function formatDateTime(date: Date | null | undefined): string {
  return date ? dateTimeFormatter.format(date) : "—";
}

const timeFormatter = new Intl.DateTimeFormat("hr-HR", { hour: "2-digit", minute: "2-digit" });

export function formatTime(date: Date | null | undefined): string {
  return date ? timeFormatter.format(date) : "—";
}

/** Format a minute count as e.g. "2 h 30 min". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
