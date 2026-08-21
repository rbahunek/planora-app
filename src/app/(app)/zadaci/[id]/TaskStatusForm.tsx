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
          <label htmlFor="statusId" className="label">
            Status
          </label>
          <select id="statusId" name="statusId" defaultValue={currentStatusId} className="input">
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.description ?? s.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Ažuriraj status
        </button>
      </div>
    </form>
  );
}
