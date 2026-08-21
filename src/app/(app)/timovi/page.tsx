import type { Metadata } from "next";
import Link from "next/link";

import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { listTeams } from "@/server/team-service";

export const metadata: Metadata = { title: "Timovi – Planora" };

export default async function TeamsPage() {
  const user = await requireUser();
  const isManager = canManage(user.role);
  const teams = await listTeams();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Timovi</h1>
        {isManager ? (
          <Link
            href="/timovi/novi"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Novi tim
          </Link>
        ) : null}
      </div>

      {teams.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">Još nema timova.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/timovi/${team.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">{team.name}</p>
                {team.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {team.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {team._count.members} članova · {team._count.projects} projekata
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
