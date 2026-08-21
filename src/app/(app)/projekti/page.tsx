import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Projekti</h1>
        {isManager ? (
          <Link
            href="/projekti/novi"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Novi projekt
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">Još nema projekata.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projekti/${project.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(project.startDate)}
                    {project.endDate ? ` – ${formatDate(project.endDate)}` : ""}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {project.description}
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {project._count.tasks} zadataka · {project._count.teams} timova
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
