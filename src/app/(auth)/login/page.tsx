import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Prijava – Planora",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Planora</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Prijavite se u svoj račun
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
