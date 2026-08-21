"use client";

import { assignTeamAction } from "../actions";

export function AssignTeamForm({
  projectId,
  teams,
}: {
  projectId: string;
  teams: { id: string; name: string }[];
}) {
  return (
    <form action={assignTeamAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
        <label htmlFor="teamId" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Dodijeli tim
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue=""
          disabled={teams.length === 0}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="" disabled>
            {teams.length === 0 ? "Nema dostupnih timova" : "Odaberite tim…"}
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={teams.length === 0}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        Dodijeli
      </button>
    </form>
  );
}
