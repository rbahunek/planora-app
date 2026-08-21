import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/AnimatedPage";
import { IconTasks } from "@/components/icons";
import { EmptyState, PageHeader, PriorityBadge, TaskStatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import { listTasksAssignedTo } from "@/server/task-service";

export const metadata: Metadata = { title: "Zadaci – Planora" };

export default async function TasksPage() {
  const user = await requireUser();
  const tasks = await listTasksAssignedTo(user.id);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow="Zadaci" title="Moji zadaci" subtitle="Zadaci dodijeljeni vama." />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<IconTasks size={22} />}
          title="Nemate dodijeljenih zadataka"
          description="Kada vam se dodijeli zadatak, pojavit će se ovdje."
        />
      ) : (
        <Stagger className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {tasks.map((t) => (
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
                {t.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {t.labels.map(({ label }) => (
                      <span
                        key={label.id}
                        className="pill border-transparent text-[0.68rem]"
                        style={{
                          backgroundColor: `${label.color ?? "#334155"}22`,
                          color: label.color ?? "#94a3b8",
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
                  <TaskStatusBadge
                    name={t.status.name}
                    label={t.status.description ?? t.status.name}
                  />
                  <div className="text-fg-subtle flex items-center gap-2 text-xs">
                    <span className="truncate">{t.project.name}</span>
                    {t.dueDate ? (
                      <span className="mono text-amber-300">{formatDate(t.dueDate)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
