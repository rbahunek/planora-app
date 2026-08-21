import type { Metadata } from "next";

import { requireManager } from "@/lib/auth/session";
import { listLabels } from "@/server/label-service";

import { deleteLabelAction } from "./actions";
import { CreateLabelForm } from "./CreateLabelForm";

export const metadata: Metadata = { title: "Oznake – Planora" };

const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export default async function LabelsPage() {
  await requireManager();
  const labels = await listLabels();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Oznake</h1>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Postojeće oznake
        </h2>
        {labels.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Još nema oznaka.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: label.color ?? "#e2e8f0" }}
                  />
                  <span className="text-sm text-slate-800 dark:text-slate-100">{label.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({label._count.tasks} zadataka)
                  </span>
                </span>
                <form action={deleteLabelAction}>
                  <input type="hidden" name="labelId" value={label.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Obriši
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Nova oznaka</h2>
        <CreateLabelForm />
      </div>
    </div>
  );
}
