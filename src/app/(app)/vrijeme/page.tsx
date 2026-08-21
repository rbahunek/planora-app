import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { formatDate, formatDuration, formatTime } from "@/lib/dates";
import { listUserTimeEntries } from "@/server/time-service";

export const metadata: Metadata = { title: "Evidencija vremena – Planora" };

export default async function TimePage() {
  const user = await requireUser();
  const entries = await listUserTimeEntries(user.id);
  const total = entries.reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">Evidencija vremena</h1>
        <span className="text-fg-muted text-sm">
          Ukupno: <strong>{formatDuration(total)}</strong>
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-fg-muted">
          Još nemate evidentiranih unosa. Vrijeme evidentirate na stranici pojedinog zadatka.
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-border text-fg-muted border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Zadatak</th>
                <th className="px-4 py-3 font-medium">Vrijeme</th>
                <th className="px-4 py-3 font-medium">Trajanje</th>
                <th className="px-4 py-3 font-medium">Napomena</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-border border-b last:border-0">
                  <td className="text-fg-muted px-4 py-3 whitespace-nowrap">
                    {formatDate(entry.entryDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/zadaci/${entry.task.id}`}
                      className="text-fg hover:text-accent hover:underline"
                    >
                      {entry.task.name}
                    </Link>
                    <span className="text-fg-subtle block text-xs">{entry.task.project.name}</span>
                  </td>
                  <td className="text-fg-muted px-4 py-3 whitespace-nowrap">
                    {formatTime(entry.startTime)}–{formatTime(entry.endTime)}
                  </td>
                  <td className="text-fg px-4 py-3 whitespace-nowrap">
                    {formatDuration(entry.durationMinutes)}
                  </td>
                  <td className="text-fg-muted px-4 py-3">{entry.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
