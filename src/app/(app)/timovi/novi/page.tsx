import type { Metadata } from "next";
import Link from "next/link";

import { requireManager } from "@/lib/auth/session";

import { createTeamAction } from "../actions";
import { TeamForm } from "../TeamForm";

export const metadata: Metadata = { title: "Novi tim – Planora" };

export default async function NewTeamPage() {
  await requireManager();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link href="/timovi" className="text-sm text-slate-500 hover:underline dark:text-slate-400">
          ← Natrag na timove
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">Novi tim</h1>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <TeamForm action={createTeamAction} submitLabel="Kreiraj tim" />
      </div>
    </div>
  );
}
