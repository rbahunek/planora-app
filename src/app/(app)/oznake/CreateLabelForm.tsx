"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import { createLabelAction, type LabelFormState } from "./actions";

export function CreateLabelForm() {
  const [state, formAction] = useActionState<LabelFormState, FormData>(createLabelAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <FormField id="name" label="Naziv oznake" />
      <FormField id="description" label="Opis (nije obavezno)" required={false} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="color" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Boja (nije obavezno)
        </label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue="#3b82f6"
          className="h-10 w-20 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
        />
      </div>
      <div>
        <SubmitButton>Dodaj oznaku</SubmitButton>
      </div>
    </form>
  );
}
