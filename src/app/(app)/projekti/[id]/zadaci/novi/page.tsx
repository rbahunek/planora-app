import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireManager } from "@/lib/auth/session";
import { getProject } from "@/server/project-service";
import { listLabels } from "@/server/label-service";
import { listPriorities, listProjectAssignees, listStatuses } from "@/server/task-service";

import { createTaskAction } from "../../../../zadaci/actions";
import { TaskForm } from "../../../../zadaci/TaskForm";

export const metadata: Metadata = { title: "Novi zadatak – Planora" };

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireManager();
  const { id } = await params;

  const project = await getProject(id);
  if (!project) notFound();

  const [statuses, priorities, assignees, labels] = await Promise.all([
    listStatuses(),
    listPriorities(),
    listProjectAssignees(id),
    listLabels(),
  ]);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <Link
          href={`/projekti/${id}`}
          className="text-fg-muted hover:text-fg text-sm hover:underline"
        >
          ← Natrag na projekt
        </Link>
        <h1 className="text-fg mt-2 text-2xl font-semibold tracking-tight">Novi zadatak</h1>
        <p className="text-fg-muted mt-1 text-sm">{project.name}</p>
      </div>
      <div className="card p-6">
        <TaskForm
          action={createTaskAction}
          projectId={id}
          statuses={statuses}
          priorities={priorities}
          assignees={assignees}
          labels={labels}
          defaults={{
            name: "",
            description: "",
            statusId: statuses[0]?.id ?? "",
            priorityId: priorities[0]?.id ?? "",
            assigneeId: null,
            startDate: "",
            dueDate: "",
            labelIds: [],
          }}
          submitLabel="Kreiraj zadatak"
        />
      </div>
    </div>
  );
}
