"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import { createFeedbackAction, type FeedbackFormState } from "./actions";

const inputClass = "input";
const labelClass = "label";

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
