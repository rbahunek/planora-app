"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import type { ProjectFormState } from "./actions";

type Action = (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;

const textareaClass = "input";

export function ProjectForm({
  action,
  projectId,
  defaults,
  submitLabel,
}: {
  action: Action;
  projectId?: string;
  defaults?: { name: string; description: string; startDate: string; endDate: string };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ProjectFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      <FormField id="name" label="Naziv projekta" defaultValue={defaults?.name} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="label">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={defaults?.description}
          className={textareaClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="startDate"
          label="Datum početka"
          type="date"
          defaultValue={defaults?.startDate}
        />
        <FormField
          id="endDate"
          label="Datum završetka (nije obavezno)"
          type="date"
          required={false}
          defaultValue={defaults?.endDate}
        />
      </div>
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
