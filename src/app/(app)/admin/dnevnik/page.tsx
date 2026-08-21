import type { Metadata } from "next";

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Dnevnik promjena</h1>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
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
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  Nema zapisa.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {dateFmt.format(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {auditActionLabel(log.action)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {personName(log.actor)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {personName(log.target)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
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
