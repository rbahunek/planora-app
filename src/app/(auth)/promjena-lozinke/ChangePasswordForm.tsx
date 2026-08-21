"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import { changePasswordAction, type ChangePasswordFormState } from "./actions";

const initialState: ChangePasswordFormState = {};

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      <FormField
        id="currentPassword"
        label="Trenutna lozinka"
        type="password"
        autoComplete="current-password"
      />
      <FormField
        id="newPassword"
        label="Nova lozinka"
        type="password"
        autoComplete="new-password"
      />
      <FormField
        id="confirmPassword"
        label="Potvrda nove lozinke"
        type="password"
        autoComplete="new-password"
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Najmanje 10 znakova, uključujući veliko i malo slovo te znamenku.
      </p>
      <SubmitButton>Promijeni lozinku</SubmitButton>
    </form>
  );
}
