"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import { createFeedbackAction, type FeedbackFormState } from "./actions";

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-200";

export function FeedbackForm() {
  const [state, formAction] = useActionState<FeedbackFormState, FormData>(createFeedbackAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="text" className={labelClass}>
          Vaša poruka
        </label>
        <textarea id="text" name="text" rows={4} required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="rating" className={labelClass}>
          Ocjena (nije obavezno)
        </label>
        <select id="rating" name="rating" defaultValue="" className={inputClass}>
          <option value="">Bez ocjene</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      <FormField
        id="attachmentUrl"
        label="Poveznica na privitak (nije obavezno)"
        type="url"
        required={false}
      />
      <div>
        <SubmitButton>Pošalji</SubmitButton>
      </div>
    </form>
  );
}
