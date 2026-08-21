import type { Metadata } from "next";

import { requireManager } from "@/lib/auth/session";
import { listLabels } from "@/server/label-service";

import { deleteLabelAction } from "./actions";
import { CreateLabelForm } from "./CreateLabelForm";

export const metadata: Metadata = { title: "Oznake – Planora" };

const sectionClass = "card flex flex-col gap-4 p-6";

export default async function LabelsPage() {
  await requireManager();
  const labels = await listLabels();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-fg text-2xl font-semibold tracking-tight">Oznake</h1>

      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Postojeće oznake</h2>
        {labels.length === 0 ? (
          <p className="text-fg-muted text-sm">Još nema oznaka.</p>
        ) : (
          <ul className="divide-border divide-y">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: label.color ?? "#e2e8f0" }}
                  />
                  <span className="text-fg text-sm">{label.name}</span>
                  <span className="text-fg-subtle text-xs">({label._count.tasks} zadataka)</span>
                </span>
                <form action={deleteLabelAction}>
                  <input type="hidden" name="labelId" value={label.id} />
                  <button type="submit" className="text-sm text-red-400 hover:underline">
                    Obriši
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Nova oznaka</h2>
        <CreateLabelForm />
      </div>
    </div>
  );
}
