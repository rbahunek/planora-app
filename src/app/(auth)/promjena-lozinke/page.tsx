import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";

import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = {
  title: "Promjena lozinke – Planora",
};

export default async function ChangePasswordPage() {
  const user = await requireUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Promjena lozinke
          </h1>
          {user.mustChangePassword ? (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Iz sigurnosnih razloga morate postaviti novu lozinku prije nastavka.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ažurirajte lozinku svog računa.
            </p>
          )}
        </div>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
