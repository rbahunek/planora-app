import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/session";
import { listRoles } from "@/server/user-service";

import { CreateUserForm } from "./CreateUserForm";

export const metadata: Metadata = {
  title: "Novi korisnik – Planora",
};

export default async function NewUserPage() {
  await requireAdmin();
  const roles = await listRoles();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href="/admin/korisnici"
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Natrag na korisnike
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Novi korisnik
        </h1>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CreateUserForm roles={roles} />
      </div>
    </div>
  );
}
