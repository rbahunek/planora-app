import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Nadzorna ploča – Planora",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Nadzorna ploča</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Dobrodošli, {user.name}. Prijavljeni ste kao <strong>{user.role}</strong>.
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Sadržaj nadzorne ploče (projekti, timovi, zadaci) dodaje se u sljedećim fazama.
      </div>
    </div>
  );
}
