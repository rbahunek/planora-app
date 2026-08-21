"use client";

import { useActionState } from "react";

import { Alert, SubmitButton } from "@/components/forms";

import { addMemberAction, type TeamFormState } from "../actions";

type Candidate = { id: string; firstName: string; lastName: string; email: string };

export function AddMemberForm({ teamId, candidates }: { teamId: string; candidates: Candidate[] }) {
  const [state, formAction] = useActionState<TeamFormState, FormData>(addMemberAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <input type="hidden" name="teamId" value={teamId} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
          <label
            htmlFor="userId"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Dodaj člana
          </label>
          <select
            id="userId"
            name="userId"
            defaultValue=""
            disabled={candidates.length === 0}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="" disabled>
              {candidates.length === 0 ? "Nema dostupnih korisnika" : "Odaberite korisnika…"}
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.lastName} {c.firstName} ({c.email})
              </option>
            ))}
          </select>
        </div>
        <SubmitButton>Dodaj</SubmitButton>
      </div>
    </form>
  );
}
