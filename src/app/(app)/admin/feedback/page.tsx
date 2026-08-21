import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { listAllFeedback } from "@/server/feedback-service";

export const metadata: Metadata = { title: "Povratne informacije korisnika – Planora" };

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const feedback = await listAllFeedback();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Povratne informacije korisnika
      </h1>

      {feedback.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">Nema povratnih informacija.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feedback.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>
                  {item.user.firstName} {item.user.lastName} · {item.user.email}
                </span>
                <span>
                  {formatDateTime(item.createdAt)}
                  {item.rating ? ` · Ocjena: ${item.rating}/5` : ""}
                </span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                {item.text}
              </p>
              {item.attachmentUrl ? (
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Privitak
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
