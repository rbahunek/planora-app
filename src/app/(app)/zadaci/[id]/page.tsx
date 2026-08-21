import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { canManage, canUpdateTaskStatus } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDate, toDateInputValue } from "@/lib/dates";
import { listLabels } from "@/server/label-service";
import { listPriorities, listProjectAssignees, listStatuses } from "@/server/task-service";
import { getTask } from "@/server/task-service";
import { listTaskTimeEntriesForUser } from "@/server/time-service";

import { deleteTaskAction, updateTaskAction } from "../actions";
import { TaskForm } from "../TaskForm";
import { TaskStatusForm } from "./TaskStatusForm";
import { TimeLog } from "./TimeLog";

export const metadata: Metadata = { title: "Zadatak – Planora" };

const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const task = await getTask(id);
  if (!task) notFound();

  const isManager = canManage(user.role);
  const canStatus = canUpdateTaskStatus(user.role, user.id, task.assignee?.id ?? null);

  const [statuses, priorities, assignees, labels] = isManager
    ? await Promise.all([
        listStatuses(),
        listPriorities(),
        listProjectAssignees(task.project.id),
        listLabels(),
      ])
    : [await listStatuses(), [], [], []];

  const timeEntries = await listTaskTimeEntriesForUser(task.id, user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/projekti/${task.project.id}`}
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← {task.project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {task.name}
        </h1>
      </div>

      {/* Overview */}
      <div className={sectionClass}>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="text-slate-900 dark:text-slate-100">
              {task.status.description ?? task.status.name}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Prioritet</dt>
            <dd className="text-slate-900 dark:text-slate-100">
              {task.priority.description ?? task.priority.name}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Izvršitelj</dt>
            <dd className="text-slate-900 dark:text-slate-100">
              {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Rok</dt>
            <dd className="text-slate-900 dark:text-slate-100">{formatDate(task.dueDate)}</dd>
          </div>
        </dl>
        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{task.description}</p>
        {task.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.labels.map(({ label }) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: label.color ?? "#e2e8f0", color: "#0f172a" }}
              >
                {label.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Time tracking (any authenticated user logs their own time) */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Evidencija vremena
        </h2>
        <TimeLog taskId={task.id} entries={timeEntries} />
      </div>

      {/* Quick status update for assignees (managers use the full form below) */}
      {canStatus && !isManager ? (
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Promjena statusa
          </h2>
          <TaskStatusForm taskId={task.id} statuses={statuses} currentStatusId={task.statusId} />
        </div>
      ) : null}

      {/* Full edit for managers */}
      {isManager ? (
        <>
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Uređivanje zadatka
            </h2>
            <TaskForm
              action={updateTaskAction}
              taskId={task.id}
              statuses={statuses}
              priorities={priorities}
              assignees={assignees}
              labels={labels}
              defaults={{
                name: task.name,
                description: task.description,
                statusId: task.statusId,
                priorityId: task.priorityId,
                assigneeId: task.assignee?.id ?? null,
                startDate: toDateInputValue(task.startDate),
                dueDate: toDateInputValue(task.dueDate),
                labelIds: task.labels.map(({ label }) => label.id),
              }}
              submitLabel="Spremi promjene"
            />
          </div>
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Opasna zona</h2>
            <form action={deleteTaskAction}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="projectId" value={task.project.id} />
              <button
                type="submit"
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
              >
                Obriši zadatak
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
