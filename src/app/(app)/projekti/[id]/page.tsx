import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDate, toDateInputValue } from "@/lib/dates";
import { getProject, listAssignableTeams } from "@/server/project-service";
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

const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";
const selectClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

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

  const [tasks, statuses, priorities, assignees, labels, assignableTeams] = await Promise.all([
    listTasks(id, filters),
    listStatuses(),
    listPriorities(),
    listProjectAssignees(id),
    listLabels(),
    isManager ? listAssignableTeams(id) : Promise.resolve([]),
  ]);

  const hasFilters = Boolean(
    filters.statusId || filters.priorityId || filters.assigneeId || filters.labelId,
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/projekti"
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Natrag na projekte
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formatDate(project.startDate)}
          {project.endDate ? ` – ${formatDate(project.endDate)}` : ""}
        </p>
      </div>

      {/* Tasks */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Zadaci ({tasks.length})
          </h2>
          {isManager ? (
            <Link
              href={`/projekti/${project.id}/zadaci/novi`}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Novi zadatak
            </Link>
          ) : null}
        </div>

        {/* Filters (GET form) */}
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
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Filtriraj
          </button>
          {hasFilters ? (
            <Link
              href={`/projekti/${project.id}`}
              className="px-2 py-1.5 text-sm text-slate-500 hover:underline dark:text-slate-400"
            >
              Poništi
            </Link>
          ) : null}
        </form>

        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nema zadataka.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => (
              <li key={task.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/zadaci/${task.id}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                  >
                    {task.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {task.status.description ?? task.status.name}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {task.priority.description ?? task.priority.name}
                    </span>
                    {task.assignee ? (
                      <span className="text-slate-500 dark:text-slate-400">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                    ) : null}
                  </div>
                </div>
                {task.labels.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {task.labels.map(({ label }) => (
                      <span
                        key={label.id}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: label.color ?? "#e2e8f0",
                          color: "#0f172a",
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Timovi</h2>
        {project.teams.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nema dodijeljenih timova.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {project.teams.map(({ team }) => (
              <li key={team.id} className="flex items-center justify-between py-2">
                <Link
                  href={`/timovi/${team.id}`}
                  className="text-sm text-slate-700 hover:underline dark:text-slate-200"
                >
                  {team.name}
                </Link>
                {isManager ? (
                  <form action={unassignTeamAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="teamId" value={team.id} />
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
        {isManager ? <AssignTeamForm projectId={project.id} teams={assignableTeams} /> : null}
      </div>

      {/* Edit + danger zone */}
      {isManager ? (
        <>
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Podaci projekta
            </h2>
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Opasna zona</h2>
            <form action={deleteProjectAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <button
                type="submit"
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
              >
                Obriši projekt
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
