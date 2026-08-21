import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth/session";
import { roleLabel } from "@/lib/labels";
import { getUserById, listRoles } from "@/server/user-service";

import { UserAdminPanel } from "./UserAdminPanel";

export const metadata: Metadata = {
  title: "Korisnik – Planora",
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [user, roles] = await Promise.all([getUserById(id), listRoles()]);
  if (!user) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/korisnici"
          className="text-fg-muted hover:text-fg text-sm hover:underline"
        >
          ← Natrag na korisnike
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-fg text-2xl font-semibold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <StatusBadge status={user.accountStatus} />
        </div>
        <p className="text-fg-muted mt-1 text-sm">
          {user.email} · {roleLabel(user.role.name)}
          {user.mustChangePassword ? " · mora promijeniti lozinku" : ""}
        </p>
      </div>

      <UserAdminPanel
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountStatus: user.accountStatus,
          roleId: user.role.id,
        }}
        roles={roles}
        isSelf={admin.id === user.id}
      />
    </div>
  );
}
