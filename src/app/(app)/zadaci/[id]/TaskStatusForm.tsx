"use client";

import { useActionState } from "react";

import { Alert } from "@/components/forms";

import { setStatusAction, type TaskFormState } from "../actions";

export function TaskStatusForm({
  taskId,
  statuses,
  currentStatusId,
}: {
  taskId: string;
  statuses: { id: string; name: string; description: string | null }[];
  currentStatusId: string;
}) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(setStatusAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[200px] flex-col gap-1.5">
          <label
            htmlFor="statusId"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Status
          </label>
          <select
            id="statusId"
            name="statusId"
            defaultValue={currentStatusId}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.description ?? s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Ažuriraj status
        </button>
      </div>
    </form>
  );
}
