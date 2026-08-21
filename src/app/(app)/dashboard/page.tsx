import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/AnimatedPage";
import { StatCard } from "@/components/StatCard";
import { IconCalendar, IconProjects, IconTasks, IconTime } from "@/components/icons";
import {
  EmptyState,
  PageHeader,
  PriorityBadge,
  ProgressBar,
  TaskStatusBadge,
} from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import { getDashboardData } from "@/server/dashboard-service";

export const metadata: Metadata = { title: "Nadzorna ploča – Planora" };

const firstName = (name?: string | null) => (name ?? "").split(" ")[0] || "";

export default async function DashboardPage() {
  const user = await requireUser();
  const { stats, projects, myTasks, upcoming } = await getDashboardData(user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Nadzorna ploča"
        title={`Dobrodošli, ${firstName(user.name)}`}
        subtitle="Pregled projekata, zadataka i evidencije rada."
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Aktivni projekti"
            value={stats.activeProjects}
            icon={<IconProjects size={18} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Zadaci u tijeku"
            value={stats.inProgress}
            icon={<IconTasks size={18} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Zadaci na provjeri"
            value={stats.inReview}
            icon={<IconTasks size={18} />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Moji evidentirani sati"
            value={stats.loggedHours}
            decimals={1}
            suffix="h"
            icon={<IconTime size={18} />}
          />
        </StaggerItem>
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project progress */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-fg font-semibold">Napredak projekata</h2>
            <Link href="/projekti" className="text-accent text-sm hover:underline">
              Svi projekti
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-fg-subtle text-sm">Još nema projekata.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {projects.map((p) => (
                <li key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <Link
                      href={`/projekti/${p.id}`}
                      className="text-fg hover:text-accent truncate text-sm font-medium"
                    >
                      {p.name}
                    </Link>
                    <span className="mono text-fg-subtle shrink-0 text-xs">
                      {p.done}/{p.total} · {p.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={p.progress}
                    tone={p.progress === 100 ? "success" : "accent"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <IconCalendar size={17} />
            <h2 className="text-fg font-semibold">Nadolazeći rokovi</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-fg-subtle text-sm">Nema nadolazećih rokova.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <Link href={`/zadaci/${t.id}`} className="group block">
                    <p className="text-fg group-hover:text-accent truncate text-sm">{t.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-fg-subtle truncate text-xs">{t.project.name}</span>
                      <span className="mono shrink-0 text-xs text-amber-300">
                        {formatDate(t.dueDate)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* My tasks */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-fg font-semibold">Moji zadaci</h2>
          <Link href="/zadaci" className="text-accent text-sm hover:underline">
            Svi moji zadaci
          </Link>
        </div>
        {myTasks.length === 0 ? (
          <EmptyState
            icon={<IconTasks size={22} />}
            title="Nemate dodijeljenih zadataka"
            description="Zadaci koji su vam dodijeljeni pojavit će se ovdje."
          />
        ) : (
          <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {myTasks.map((t) => (
              <StaggerItem key={t.id}>
                <Link
                  href={`/zadaci/${t.id}`}
                  className="card card-interactive flex flex-col gap-3 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-fg text-sm font-medium">{t.name}</p>
                    <PriorityBadge
                      name={t.priority.name}
                      label={t.priority.description ?? t.priority.name}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <TaskStatusBadge
                      name={t.status.name}
                      label={t.status.description ?? t.status.name}
                    />
                    <span className="text-fg-subtle truncate text-xs">{t.project.name}</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
