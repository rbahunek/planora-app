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
        <label htmlFor="teamId" className="label">
          Dodijeli tim
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue=""
          disabled={teams.length === 0}
          className="input disabled:opacity-60"
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
      <button type="submit" disabled={teams.length === 0} className="btn btn-primary">
        Dodijeli
      </button>
    </form>
  );
}
