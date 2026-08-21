"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import type { TeamFormState } from "./actions";

type Action = (state: TeamFormState, formData: FormData) => Promise<TeamFormState>;

export function TeamForm({
  action,
  teamId,
  defaults,
  submitLabel,
}: {
  action: Action;
  teamId?: string;
  defaults?: { name: string; description: string | null };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<TeamFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      {teamId ? <input type="hidden" name="teamId" value={teamId} /> : null}
      <FormField id="name" label="Naziv tima" defaultValue={defaults?.name} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="label">
          Opis (nije obavezno)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="input"
        />
      </div>
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
