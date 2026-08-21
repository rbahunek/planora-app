import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { IconPlus } from "@/components/icons";
import { PageHeader, UserAvatar } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { roleLabel } from "@/lib/labels";
import { listUsers } from "@/server/user-service";

export const metadata: Metadata = {
  title: "Korisnici – Planora",
};

const dateFmt = new Intl.DateTimeFormat("hr-HR", { dateStyle: "medium", timeStyle: "short" });

export default async function UsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Administracija"
        title="Korisnici"
        subtitle={`${users.length} korisnika u sustavu.`}
        actions={
          <Link href="/admin/korisnici/novi" className="btn btn-primary">
            <IconPlus size={16} />
            Novi korisnik
          </Link>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-border bg-surface text-fg-subtle sticky top-0 border-b text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Korisnik</th>
              <th className="px-4 py-3 font-medium">Uloga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Zadnja prijava</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-border hover:bg-surface-hover border-b transition-colors last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/korisnici/${user.id}`}
                    className="group flex items-center gap-3"
                  >
                    <UserAvatar firstName={user.firstName} lastName={user.lastName} size={34} />
                    <span className="min-w-0">
                      <span className="text-fg group-hover:text-accent block truncate font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="mono text-fg-subtle block truncate text-xs">
                        {user.email}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="text-fg-muted px-4 py-3">{roleLabel(user.role.name)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.accountStatus} />
                </td>
                <td className="mono text-fg-muted px-4 py-3 text-xs">
                  {user.lastLoginAt ? dateFmt.format(user.lastLoginAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
