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
        <Link href="/projekti" className="text-fg-muted hover:text-fg text-sm hover:underline">
          ← Natrag na projekte
        </Link>
        <h1 className="text-fg mt-2 text-2xl font-semibold tracking-tight">Novi projekt</h1>
      </div>
      <div className="card p-6">
        <ProjectForm action={createProjectAction} submitLabel="Kreiraj projekt" />
      </div>
    </div>
  );
}
