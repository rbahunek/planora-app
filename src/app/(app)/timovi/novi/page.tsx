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
        <Link href="/timovi" className="text-fg-muted hover:text-fg text-sm hover:underline">
          ← Natrag na timove
        </Link>
        <h1 className="text-fg mt-2 text-2xl font-semibold tracking-tight">Novi tim</h1>
      </div>
      <div className="card p-6">
        <TeamForm action={createTeamAction} submitLabel="Kreiraj tim" />
      </div>
    </div>
  );
}
