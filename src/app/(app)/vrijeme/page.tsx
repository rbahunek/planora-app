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
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Evidencija vremena
        </h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Ukupno: <strong>{formatDuration(total)}</strong>
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          Još nemate evidentiranih unosa. Vrijeme evidentirate na stranici pojedinog zadatka.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
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
                <tr
                  key={entry.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatDate(entry.entryDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/zadaci/${entry.task.id}`}
                      className="text-slate-900 hover:underline dark:text-slate-100"
                    >
                      {entry.task.name}
                    </Link>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      {entry.task.project.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatTime(entry.startTime)}–{formatTime(entry.endTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">
                    {formatDuration(entry.durationMinutes)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {entry.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
