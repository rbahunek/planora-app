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

const inputClass = "input";
const labelClass = "label";

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
          <p className="label">Vaši unosi (ukupno {formatDuration(total)})</p>
          <ul className="divide-border divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-fg">
                  {formatDate(entry.entryDate)} · {formatTime(entry.startTime)}–
                  {formatTime(entry.endTime)} ·{" "}
                  <strong>{formatDuration(entry.durationMinutes)}</strong>
                  {entry.description ? (
                    <span className="text-fg-muted"> · {entry.description}</span>
                  ) : null}
                </span>
                <form action={deleteTimeEntryAction}>
                  <input type="hidden" name="entryId" value={entry.id} />
                  <input type="hidden" name="taskId" value={taskId} />
                  <button type="submit" className="text-red-400 hover:underline">
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
