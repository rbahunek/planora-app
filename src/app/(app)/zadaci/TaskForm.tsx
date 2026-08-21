"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import type { TaskFormState } from "./actions";

type Option = { id: string; name: string; description?: string | null };
type Person = { id: string; firstName: string; lastName: string };
type Action = (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;

const inputClass = "input";
const labelClass = "label";

export function TaskForm({
  action,
  taskId,
  projectId,
  statuses,
  priorities,
  assignees,
  labels,
  defaults,
  submitLabel,
}: {
  action: Action;
  taskId?: string;
  projectId?: string;
  statuses: Option[];
  priorities: Option[];
  assignees: Person[];
  labels: { id: string; name: string }[];
  defaults?: {
    name: string;
    description: string;
    statusId: string;
    priorityId: string;
    assigneeId: string | null;
    startDate: string;
    dueDate: string;
    labelIds: string[];
  };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(action, {});
  const selectedLabels = new Set(defaults?.labelIds ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      {taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}

      <FormField id="name" label="Naziv zadatka" defaultValue={defaults?.name} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={defaults?.description}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="statusId" className={labelClass}>
            Status
          </label>
          <select
            id="statusId"
            name="statusId"
            defaultValue={defaults?.statusId ?? ""}
            className={inputClass}
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.description ?? s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="priorityId" className={labelClass}>
            Prioritet
          </label>
          <select
            id="priorityId"
            name="priorityId"
            defaultValue={defaults?.priorityId ?? ""}
            className={inputClass}
          >
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.description ?? p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="assigneeId" className={labelClass}>
          Izvršitelj (nije obavezno)
        </label>
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue={defaults?.assigneeId ?? ""}
          className={inputClass}
        >
          <option value="">Bez izvršitelja</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.firstName} {a.lastName}
            </option>
          ))}
        </select>
        {assignees.length === 0 ? (
          <p className="text-fg-muted text-xs">
            Dodijelite tim projektu kako biste imali izvršitelje.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="startDate"
          label="Datum početka (nije obavezno)"
          type="date"
          required={false}
          defaultValue={defaults?.startDate}
        />
        <FormField
          id="dueDate"
          label="Rok (nije obavezno)"
          type="date"
          required={false}
          defaultValue={defaults?.dueDate}
        />
      </div>

      {labels.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Oznake</span>
          <div className="flex flex-wrap gap-3">
            {labels.map((l) => (
              <label key={l.id} className="text-fg flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="labelIds"
                  value={l.id}
                  defaultChecked={selectedLabels.has(l.id)}
                  className="border-border h-4 w-4 rounded"
                />
                {l.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
