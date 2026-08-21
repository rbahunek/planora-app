import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/AnimatedPage";
import { IconPlus, IconTeams } from "@/components/icons";
import { EmptyState, PageHeader } from "@/components/ui";
import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { listTeams } from "@/server/team-service";

export const metadata: Metadata = { title: "Timovi – Planora" };

export default async function TeamsPage() {
  const user = await requireUser();
  const isManager = canManage(user.role);
  const teams = await listTeams();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Timovi"
        title="Timovi"
        subtitle="Timovi i njihovi članovi."
        actions={
          isManager ? (
            <Link href="/timovi/novi" className="btn btn-primary">
              <IconPlus size={16} />
              Novi tim
            </Link>
          ) : null
        }
      />

      {teams.length === 0 ? (
        <EmptyState icon={<IconTeams size={22} />} title="Još nema timova." />
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <StaggerItem key={team.id}>
              <Link href={`/timovi/${team.id}`} className="card card-interactive block h-full p-5">
                <div className="flex items-center gap-3">
                  <span className="border-border bg-elevated text-accent flex h-9 w-9 items-center justify-center rounded-lg border">
                    <IconTeams size={17} />
                  </span>
                  <p className="text-fg font-medium">{team.name}</p>
                </div>
                {team.description ? (
                  <p className="text-fg-muted mt-3 line-clamp-2 text-sm">{team.description}</p>
                ) : null}
                <p className="mono text-fg-subtle mt-3 text-xs">
                  {team._count.members} članova · {team._count.projects} projekata
                </p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
