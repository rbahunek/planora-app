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

const sectionClass = "card flex flex-col gap-4 p-6";

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
        <Link href="/timovi" className="text-fg-muted hover:text-fg text-sm hover:underline">
          ← Natrag na timove
        </Link>
        <h1 className="text-fg mt-2 text-2xl font-semibold tracking-tight">{team.name}</h1>
      </div>

      {isManager ? (
        <div className={sectionClass}>
          <h2 className="text-fg text-lg font-semibold">Podaci tima</h2>
          <TeamForm
            action={updateTeamAction}
            teamId={team.id}
            defaults={{ name: team.name, description: team.description }}
            submitLabel="Spremi promjene"
          />
        </div>
      ) : team.description ? (
        <div className={sectionClass}>
          <p className="text-fg-muted">{team.description}</p>
        </div>
      ) : null}

      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Članovi ({team.members.length})</h2>
        {team.members.length === 0 ? (
          <p className="text-fg-muted text-sm">Tim još nema članova.</p>
        ) : (
          <ul className="divide-border divide-y">
            {team.members.map((member) => (
              <li key={member.user.id} className="flex items-center justify-between py-2">
                <span className="text-fg text-sm">
                  {member.user.firstName} {member.user.lastName}
                  <span className="text-fg-subtle"> · {member.user.email}</span>
                </span>
                {isManager ? (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <input type="hidden" name="userId" value={member.user.id} />
                    <button type="submit" className="text-sm text-red-400 hover:underline">
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
          <h2 className="text-fg text-lg font-semibold">Opasna zona</h2>
          <form action={deleteTeamAction}>
            <input type="hidden" name="teamId" value={team.id} />
            <button type="submit" className="btn btn-danger">
              Obriši tim
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
