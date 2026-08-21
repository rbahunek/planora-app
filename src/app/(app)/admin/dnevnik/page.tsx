import type { Metadata } from "next";

import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { auditActionLabel } from "@/lib/labels";
import { listAuditLogs } from "@/server/audit-service";

export const metadata: Metadata = {
  title: "Dnevnik promjena – Planora",
};

const dateFmt = new Intl.DateTimeFormat("hr-HR", { dateStyle: "medium", timeStyle: "medium" });

function personName(person: { firstName: string; lastName: string } | null): string {
  if (!person) return "—";
  return `${person.firstName} ${person.lastName}`;
}

export default async function AuditLogPage() {
  await requireAdmin();
  const logs = await listAuditLogs();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Administracija"
        title="Dnevnik promjena"
        subtitle="Zapisi sigurnosno relevantnih događaja."
      />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-border bg-surface text-fg-subtle sticky top-0 border-b text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Vrijeme</th>
              <th className="px-4 py-3 font-medium">Radnja</th>
              <th className="px-4 py-3 font-medium">Izvršio</th>
              <th className="px-4 py-3 font-medium">Nad korisnikom</th>
              <th className="px-4 py-3 font-medium">Detalji</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-fg-muted px-4 py-6 text-center">
                  Nema zapisa.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-border hover:bg-surface-hover border-b transition-colors last:border-0"
                >
                  <td className="mono text-fg-muted px-4 py-3 text-xs whitespace-nowrap">
                    {dateFmt.format(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono pill border-accent/25 bg-accent/10 text-accent">
                      {auditActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="text-fg-muted px-4 py-3">{personName(log.actor)}</td>
                  <td className="text-fg-muted px-4 py-3">{personName(log.target)}</td>
                  <td className="mono text-fg-subtle px-4 py-3 text-xs">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
