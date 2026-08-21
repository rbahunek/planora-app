"use client";

import { useActionState } from "react";

import { Alert, SubmitButton } from "@/components/forms";
import { formatDate, formatDuration, formatTime, toDateInputValue } from "@/lib/dates";

import {
  createTimeEntryAction,
  deleteTimeEntryAction,
  type TimeEntryFormState,
} from "../../vrijeme/actions";

type Entry = {
  id: string;
  entryDate: Date;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  description: string | null;
};

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-200";

export function TimeLog({ taskId, entries }: { taskId: string; entries: Entry[] }) {
  const [state, formAction] = useActionState<TimeEntryFormState, FormData>(
    createTimeEntryAction,
    {},
  );
  const total = entries.reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        {state.error ? <Alert>{state.error}</Alert> : null}
        {state.message ? <Alert tone="success">{state.message}</Alert> : null}
        <input type="hidden" name="taskId" value={taskId} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="entryDate" className={labelClass}>
              Datum
            </label>
            <input
              id="entryDate"
              name="entryDate"
              type="date"
              required
              defaultValue={toDateInputValue(new Date())}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="startTime" className={labelClass}>
              Početak
            </label>
            <input id="startTime" name="startTime" type="time" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="endTime" className={labelClass}>
              Završetak
            </label>
            <input id="endTime" name="endTime" type="time" required className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className={labelClass}>
            Napomena (nije obavezno)
          </label>
          <input id="description" name="description" className={inputClass} />
        </div>
        <div>
          <SubmitButton>Evidentiraj vrijeme</SubmitButton>
        </div>
      </form>

      {entries.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Vaši unosi (ukupno {formatDuration(total)})
          </p>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-slate-700 dark:text-slate-200">
                  {formatDate(entry.entryDate)} · {formatTime(entry.startTime)}–
                  {formatTime(entry.endTime)} ·{" "}
                  <strong>{formatDuration(entry.durationMinutes)}</strong>
                  {entry.description ? (
                    <span className="text-slate-500 dark:text-slate-400">
                      {" "}
                      · {entry.description}
                    </span>
                  ) : null}
                </span>
                <form action={deleteTimeEntryAction}>
                  <input type="hidden" name="entryId" value={entry.id} />
                  <input type="hidden" name="taskId" value={taskId} />
                  <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                    Obriši
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
