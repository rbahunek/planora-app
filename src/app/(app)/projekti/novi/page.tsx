import type { Metadata } from "next";
import Link from "next/link";

import { requireManager } from "@/lib/auth/session";

import { createProjectAction } from "../actions";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = { title: "Novi projekt – Planora" };

export default async function NewProjectPage() {
  await requireManager();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href="/projekti"
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Natrag na projekte
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Novi projekt
        </h1>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ProjectForm action={createProjectAction} submitLabel="Kreiraj projekt" />
      </div>
    </div>
  );
}
