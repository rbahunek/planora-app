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
          className="text-fg-muted hover:text-fg text-sm hover:underline"
        >
          ← Natrag na korisnike
        </Link>
        <h1 className="text-fg mt-2 text-2xl font-semibold tracking-tight">Novi korisnik</h1>
      </div>
      <div className="card p-6">
        <CreateUserForm roles={roles} />
      </div>
    </div>
  );
}
