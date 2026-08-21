import type { Metadata } from "next";

import { AnimatedPage } from "@/components/AnimatedPage";
import { PlanoraWordmark } from "@/components/Brand";
import { DotGridBackground } from "@/components/DotGridBackground";
import { safeCallbackUrl } from "@/lib/auth/redirects";

import { LoginForm } from "./LoginForm";
import { LoginWorkflow } from "./LoginWorkflow";

export const metadata: Metadata = {
  title: "Prijava – Planora",
};

const FEATURES = ["Projekti i zadaci", "Evidencija vremena", "Timska suradnja"];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawCallback = Array.isArray(sp.callbackUrl) ? sp.callbackUrl[0] : sp.callbackUrl;
  const callbackUrl = safeCallbackUrl(rawCallback);

  return (
    <main className="bg-background relative min-h-screen overflow-hidden">
      <DotGridBackground />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-5 py-10 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Left — brand & workflow */}
        <section className="hidden flex-col justify-center lg:flex">
          <PlanoraWordmark />
          <span className="mono border-border bg-surface/60 text-fg-muted mt-8 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem] tracking-[0.16em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            Upravljanje projektima
          </span>
          <h1 className="text-fg mt-5 max-w-md text-4xl font-semibold tracking-tight">
            Jasan pregled svakog projekta.
          </h1>
          <p className="text-fg-muted mt-4 max-w-md text-[0.95rem] leading-relaxed">
            Planirajte zadatke, povežite timove i pratite napredak na jednom mjestu.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <span
                key={f}
                className="border-border bg-surface/50 text-fg-muted rounded-full border px-3 py-1 text-xs"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <LoginWorkflow />
          </div>
        </section>

        {/* Right — login panel */}
        <section className="flex flex-col justify-center">
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <PlanoraWordmark />
          </div>
          <AnimatedPage className="mx-auto w-full max-w-sm">
            <div className="card glow-accent p-7 sm:p-8">
              <h2 className="text-fg text-xl font-semibold tracking-tight">
                Dobro došli u Planoru
              </h2>
              <p className="text-fg-muted mt-1 text-sm">Prijavite se kako biste nastavili.</p>
              <div className="mt-6">
                <LoginForm callbackUrl={callbackUrl} />
              </div>
            </div>
            <p className="text-fg-subtle mt-4 text-center text-xs">
              Sigurna prijava · pristup samo ovlaštenim korisnicima
            </p>
          </AnimatedPage>
        </section>
      </div>
    </main>
  );
}
