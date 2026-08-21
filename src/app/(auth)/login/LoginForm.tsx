"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";

import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      <FormField id="email" label="E-mail" type="email" autoComplete="email" />
      <FormField id="password" label="Lozinka" type="password" autoComplete="current-password" />
      <SubmitButton>Prijava</SubmitButton>
    </form>
  );
}
