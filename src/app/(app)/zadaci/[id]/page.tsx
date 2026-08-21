import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { IconArrowLeft } from "@/components/icons";
import { PriorityBadge, TaskStatusBadge, UserAvatar } from "@/components/ui";
import { canManage, canUpdateTaskStatus } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDate, toDateInputValue } from "@/lib/dates";
import { listLabels } from "@/server/label-service";
import { getTask, listPriorities, listProjectAssignees, listStatuses } from "@/server/task-service";
import { listTaskTimeEntriesForUser } from "@/server/time-service";

import { deleteTaskAction, updateTaskAction } from "../actions";
import { TaskForm } from "../TaskForm";
import { TaskStatusForm } from "./TaskStatusForm";
import { TimeLog } from "./TimeLog";

export const metadata: Metadata = { title: "Zadatak – Planora" };

const sectionClass = "card flex flex-col gap-4 p-6";

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
          className="mono text-fg-muted hover:text-fg inline-flex items-center gap-1.5 text-xs transition"
        >
          <IconArrowLeft size={14} /> {task.project.name}
        </Link>
        <div className="card mt-3 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-fg text-2xl font-semibold tracking-tight">{task.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge
                name={task.priority.name}
                label={task.priority.description ?? task.priority.name}
              />
              <TaskStatusBadge
                name={task.status.name}
                label={task.status.description ?? task.status.name}
              />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-fg-subtle text-xs">Izvršitelj</dt>
              <dd className="text-fg mt-1.5 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <UserAvatar
                      firstName={task.assignee.firstName}
                      lastName={task.assignee.lastName}
                      size={24}
                    />
                    <span className="truncate">
                      {task.assignee.firstName} {task.assignee.lastName}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-fg-subtle text-xs">Rok</dt>
              <dd className="mono mt-1.5 text-amber-300">{formatDate(task.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle text-xs">Početak</dt>
              <dd className="mono text-fg-muted mt-1.5">{formatDate(task.startDate)}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle text-xs">Oznake</dt>
              <dd className="text-fg-muted mt-1.5">{task.labels.length}</dd>
            </div>
          </dl>

          <p className="border-border text-fg-muted mt-5 border-t pt-4 text-sm whitespace-pre-wrap">
            {task.description}
          </p>
          {task.labels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1">
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
        </div>
      </div>

      {/* Time tracking */}
      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Evidencija vremena</h2>
        <TimeLog taskId={task.id} entries={timeEntries} />
      </div>

      {/* Quick status update for assignees */}
      {canStatus && !isManager ? (
        <div className={sectionClass}>
          <h2 className="text-fg text-lg font-semibold">Promjena statusa</h2>
          <TaskStatusForm taskId={task.id} statuses={statuses} currentStatusId={task.statusId} />
        </div>
      ) : null}

      {/* Full edit for managers */}
      {isManager ? (
        <>
          <div className={sectionClass}>
            <h2 className="text-fg text-lg font-semibold">Uređivanje zadatka</h2>
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
            <h2 className="text-fg text-lg font-semibold">Opasna zona</h2>
            <div>
              <ConfirmSubmit
                action={deleteTaskAction}
                hidden={{ taskId: task.id, projectId: task.project.id }}
                triggerLabel="Obriši zadatak"
                title="Obrisati zadatak?"
                description="Ova radnja je nepovratna."
                confirmLabel="Obriši zadatak"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
