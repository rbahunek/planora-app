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
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Opis (nije obavezno)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
