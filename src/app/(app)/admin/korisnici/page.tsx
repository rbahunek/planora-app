import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Korisnici</h1>
        <Link
          href="/admin/korisnici/novi"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Novi korisnik
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Ime i prezime</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Uloga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Zadnja prijava</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/korisnici/${user.id}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {roleLabel(user.role.name)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.accountStatus} />
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
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
