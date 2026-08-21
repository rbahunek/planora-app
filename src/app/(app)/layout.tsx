import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/LogoutButton";
import { ROLES } from "@/lib/auth/constants";
import { canManage } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";

const navLinkClass =
  "text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Defense-in-depth: force the password change server-side on every app page,
  // not just via middleware (which a soft client navigation could bypass).
  // The change page lives in the (auth) group, so it is not affected here.
  if (user.mustChangePassword) redirect("/promjena-lozinke");

  const isAdmin = user.role === ROLES.ADMIN;
  const isManager = canManage(user.role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Planora
            </Link>
            <Link href="/projekti" className={navLinkClass}>
              Projekti
            </Link>
            <Link href="/timovi" className={navLinkClass}>
              Timovi
            </Link>
            <Link href="/vrijeme" className={navLinkClass}>
              Vrijeme
            </Link>
            <Link href="/feedback" className={navLinkClass}>
              Feedback
            </Link>
            {isManager ? (
              <Link href="/oznake" className={navLinkClass}>
                Oznake
              </Link>
            ) : null}
            {isAdmin ? (
              <>
                <Link href="/admin/korisnici" className={navLinkClass}>
                  Korisnici
                </Link>
                <Link href="/admin/feedback" className={navLinkClass}>
                  Povratne info.
                </Link>
                <Link href="/admin/dnevnik" className={navLinkClass}>
                  Dnevnik
                </Link>
              </>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {user.name} · {user.role}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
