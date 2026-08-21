import type { Metadata } from "next";

import { AnimatedPage } from "@/components/AnimatedPage";
import { PlanoraWordmark } from "@/components/Brand";
import { DotGridBackground } from "@/components/DotGridBackground";
import { requireUser } from "@/lib/auth/session";

import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = {
  title: "Promjena lozinke – Planora",
};

export default async function ChangePasswordPage() {
  const user = await requireUser();

  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <DotGridBackground />
      <AnimatedPage className="relative w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <PlanoraWordmark />
        </div>
        <div className="card glow-accent p-7 sm:p-8">
          <h1 className="text-fg text-xl font-semibold tracking-tight">Promjena lozinke</h1>
          {user.mustChangePassword ? (
            <p className="border-warning/30 bg-warning/10 mt-2 rounded-lg border px-3 py-2 text-sm text-amber-300">
              Iz sigurnosnih razloga morate postaviti novu lozinku prije nastavka.
            </p>
          ) : (
            <p className="text-fg-muted mt-1 text-sm">Ažurirajte lozinku svog računa.</p>
          )}
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
      </AnimatedPage>
    </main>
  );
}
