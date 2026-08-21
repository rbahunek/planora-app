import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Defense-in-depth: force the password change server-side on every app page.
  if (user.mustChangePassword) redirect("/promjena-lozinke");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AppShell>
  );
}
