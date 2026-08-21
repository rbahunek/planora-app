"use client";

import { useActionState } from "react";

import { Alert, FormField, SubmitButton } from "@/components/forms";
import { roleLabel } from "@/lib/labels";

import { createUserAction, type CreateUserFormState } from "../actions";

const initialState: CreateUserFormState = {};

export function CreateUserForm({ roles }: { roles: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      <FormField id="firstName" label="Ime" autoComplete="given-name" />
      <FormField id="lastName" label="Prezime" autoComplete="family-name" />
      <FormField id="email" label="E-mail" type="email" autoComplete="email" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="roleId" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Uloga
        </label>
        <select
          id="roleId"
          name="roleId"
          required
          defaultValue=""
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="" disabled>
            Odaberite ulogu…
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {roleLabel(role.name)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Korisnik se kreira bez lozinke (status „Neaktivan“). Pristupne podatke generirate na
        stranici korisnika.
      </p>
      <SubmitButton>Kreiraj korisnika</SubmitButton>
    </form>
  );
}
