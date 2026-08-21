import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { IconArrowLeft, IconPlus } from "@/components/icons";
import { PriorityBadge, ProgressBar, TaskStatusBadge, UserAvatar } from "@/components/ui";
import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDate, toDateInputValue } from "@/lib/dates";
import { getProject, getProjectProgress, listAssignableTeams } from "@/server/project-service";
import { listLabels } from "@/server/label-service";
import {
  listPriorities,
  listProjectAssignees,
  listStatuses,
  listTasks,
  type TaskFilters,
} from "@/server/task-service";

import { deleteProjectAction, unassignTeamAction, updateProjectAction } from "../actions";
import { ProjectForm } from "../ProjectForm";
import { AssignTeamForm } from "./AssignTeamForm";

export const metadata: Metadata = { title: "Projekt – Planora" };

const sectionClass = "card flex flex-col gap-4 p-6";
const selectClass = "input px-2.5 py-1.5 text-sm";

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v ? v : undefined;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const isManager = canManage(user.role);
  const { id } = await params;
  const sp = await searchParams;

  const project = await getProject(id);
  if (!project) notFound();

  const filters: TaskFilters = {
    statusId: first(sp.statusId),
    priorityId: first(sp.priorityId),
    assigneeId: first(sp.assigneeId),
    labelId: first(sp.labelId),
  };

  const [tasks, statuses, priorities, assignees, labels, assignableTeams, progress] =
    await Promise.all([
      listTasks(id, filters),
      listStatuses(),
      listPriorities(),
      listProjectAssignees(id),
      listLabels(),
      isManager ? listAssignableTeams(id) : Promise.resolve([]),
      getProjectProgress(id),
    ]);

  const hasFilters = Boolean(
    filters.statusId || filters.priorityId || filters.assigneeId || filters.labelId,
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/projekti"
          className="mono text-fg-muted hover:text-fg inline-flex items-center gap-1.5 text-xs transition"
        >
          <IconArrowLeft size={14} /> Natrag na projekte
        </Link>
        <div className="card mt-3 overflow-hidden p-6">
          <h1 className="text-fg text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-fg-muted mt-1.5 max-w-2xl text-sm">{project.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="mono text-fg-subtle text-xs">
              {formatDate(project.startDate)}
              {project.endDate ? ` – ${formatDate(project.endDate)}` : " – u tijeku"}
            </span>
            <div className="flex flex-1 items-center gap-3">
              <ProgressBar
                value={progress.progress}
                tone={progress.progress === 100 ? "success" : "accent"}
              />
              <span className="mono text-fg-subtle shrink-0 text-xs">
                {progress.done}/{progress.total} · {progress.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-fg text-lg font-semibold">Zadaci ({tasks.length})</h2>
          {isManager ? (
            <Link href={`/projekti/${project.id}/zadaci/novi`} className="btn btn-primary">
              <IconPlus size={16} />
              Novi zadatak
            </Link>
          ) : null}
        </div>

        <form method="get" className="flex flex-wrap items-end gap-2">
          <select name="statusId" defaultValue={filters.statusId ?? ""} className={selectClass}>
            <option value="">Svi statusi</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.description ?? s.name}
              </option>
            ))}
          </select>
          <select name="priorityId" defaultValue={filters.priorityId ?? ""} className={selectClass}>
            <option value="">Svi prioriteti</option>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.description ?? p.name}
              </option>
            ))}
          </select>
          <select name="assigneeId" defaultValue={filters.assigneeId ?? ""} className={selectClass}>
            <option value="">Svi izvršitelji</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
          <select name="labelId" defaultValue={filters.labelId ?? ""} className={selectClass}>
            <option value="">Sve oznake</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-ghost">
            Filtriraj
          </button>
          {hasFilters ? (
            <Link
              href={`/projekti/${project.id}`}
              className="text-fg-muted hover:text-fg px-2 py-1.5 text-sm transition"
            >
              Poništi
            </Link>
          ) : null}
        </form>

        {tasks.length === 0 ? (
          <p className="text-fg-subtle py-6 text-center text-sm">
            Nema zadataka za odabrane filtere.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {tasks.map((task) => (
              <li key={task.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/zadaci/${task.id}`}
                    className="text-fg hover:text-accent min-w-0 flex-1 truncate font-medium transition"
                  >
                    {task.name}
                  </Link>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <PriorityBadge
                      name={task.priority.name}
                      label={task.priority.description ?? task.priority.name}
                    />
                    <TaskStatusBadge
                      name={task.status.name}
                      label={task.status.description ?? task.status.name}
                    />
                    {task.assignee ? (
                      <UserAvatar
                        firstName={task.assignee.firstName}
                        lastName={task.assignee.lastName}
                        size={26}
                      />
                    ) : null}
                  </div>
                </div>
                {task.labels.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.labels.map(({ label }) => (
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
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Teams */}
      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Timovi</h2>
        {project.teams.length === 0 ? (
          <p className="text-fg-muted text-sm">Nema dodijeljenih timova.</p>
        ) : (
          <ul className="divide-border divide-y">
            {project.teams.map(({ team }) => (
              <li key={team.id} className="flex items-center justify-between py-2">
                <Link
                  href={`/timovi/${team.id}`}
                  className="text-fg hover:text-accent text-sm transition"
                >
                  {team.name}
                </Link>
                {isManager ? (
                  <form action={unassignTeamAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="teamId" value={team.id} />
                    <button type="submit" className="text-sm text-red-400 hover:underline">
                      Ukloni
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {isManager ? <AssignTeamForm projectId={project.id} teams={assignableTeams} /> : null}
      </div>

      {/* Edit + danger zone */}
      {isManager ? (
        <>
          <div className={sectionClass}>
            <h2 className="text-fg text-lg font-semibold">Podaci projekta</h2>
            <ProjectForm
              action={updateProjectAction}
              projectId={project.id}
              defaults={{
                name: project.name,
                description: project.description,
                startDate: toDateInputValue(project.startDate),
                endDate: toDateInputValue(project.endDate),
              }}
              submitLabel="Spremi promjene"
            />
          </div>
          <div className={sectionClass}>
            <h2 className="text-fg text-lg font-semibold">Opasna zona</h2>
            <p className="text-fg-muted text-sm">
              Brisanje projekta trajno uklanja projekt i sve njegove zadatke.
            </p>
            <div>
              <ConfirmSubmit
                action={deleteProjectAction}
                hidden={{ projectId: project.id }}
                triggerLabel="Obriši projekt"
                title="Obrisati projekt?"
                description="Ova radnja je nepovratna i uklanja sve zadatke projekta."
                confirmLabel="Obriši projekt"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
