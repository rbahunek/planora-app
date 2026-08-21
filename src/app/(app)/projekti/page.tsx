import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/AnimatedPage";
import { IconPlus, IconProjects } from "@/components/icons";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import { listProjects } from "@/server/project-service";

export const metadata: Metadata = { title: "Projekti – Planora" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const isManager = canManage(user.role);
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Projekti"
        title="Projekti"
        subtitle="Svi projekti i njihov napredak."
        actions={
          isManager ? (
            <Link href="/projekti/novi" className="btn btn-primary">
              <IconPlus size={16} />
              Novi projekt
            </Link>
          ) : null
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<IconProjects size={22} />}
          title="Još nema projekata"
          description={isManager ? "Kreirajte prvi projekt." : "Projekti će se pojaviti ovdje."}
          action={
            isManager ? (
              <Link href="/projekti/novi" className="btn btn-primary">
                Novi projekt
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.id}>
              <Link
                href={`/projekti/${p.id}`}
                className="card card-interactive flex h-full flex-col gap-4 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-fg font-medium">{p.name}</p>
                  <span className="mono text-fg-subtle shrink-0 text-xs">{p.progress}%</span>
                </div>
                <p className="text-fg-muted line-clamp-2 flex-1 text-sm">{p.description}</p>
                <ProgressBar value={p.progress} tone={p.progress === 100 ? "success" : "accent"} />
                <div className="text-fg-subtle flex items-center justify-between text-xs">
                  <span>
                    {p._count.tasks} zadataka · {p._count.teams} timova
                  </span>
                  <span className="mono">
                    {formatDate(p.startDate)}
                    {p.endDate ? ` – ${formatDate(p.endDate)}` : ""}
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
