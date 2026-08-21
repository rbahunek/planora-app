import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { getTeam, listAssignableUsers } from "@/server/team-service";

import { deleteTeamAction, removeMemberAction, updateTeamAction } from "../actions";
import { TeamForm } from "../TeamForm";
import { AddMemberForm } from "./AddMemberForm";

export const metadata: Metadata = { title: "Tim – Planora" };

const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const isManager = canManage(user.role);
  const { id } = await params;

  const team = await getTeam(id);
  if (!team) notFound();

  const candidates = isManager ? await listAssignableUsers(id) : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/timovi" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Natrag na timove
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {team.name}
        </h1>
      </div>

      {isManager ? (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Podaci tima</h2>
          <TeamForm
            action={updateTeamAction}
            teamId={team.id}
            defaults={{ name: team.name, description: team.description }}
            submitLabel="Spremi promjene"
          />
        </div>
      ) : team.description ? (
        <div className={sectionClass}>
          <p className="text-slate-600 dark:text-slate-300">{team.description}</p>
        </div>
      ) : null}

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Članovi ({team.members.length})
        </h2>
        {team.members.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Tim još nema članova.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {team.members.map((member) => (
              <li key={member.user.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {member.user.firstName} {member.user.lastName}
                  <span className="text-slate-400 dark:text-slate-500"> · {member.user.email}</span>
                </span>
                {isManager ? (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <input type="hidden" name="userId" value={member.user.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Ukloni
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {isManager ? <AddMemberForm teamId={team.id} candidates={candidates} /> : null}
      </div>

      {isManager ? (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Opasna zona</h2>
          <form action={deleteTeamAction}>
            <input type="hidden" name="teamId" value={team.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            >
              Obriši tim
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
