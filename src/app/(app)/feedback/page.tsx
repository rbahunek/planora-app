import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { listUserFeedback } from "@/server/feedback-service";

import { FeedbackForm } from "./FeedbackForm";

export const metadata: Metadata = { title: "Povratne informacije – Planora" };

const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export default async function FeedbackPage() {
  const user = await requireUser();
  const feedback = await listUserFeedback(user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Povratne informacije
      </h1>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Nova poruka</h2>
        <FeedbackForm />
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Vaše prethodne poruke
        </h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Još niste poslali poruke.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {feedback.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-slate-100 p-3 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span>{formatDateTime(item.createdAt)}</span>
                  {item.rating ? <span>Ocjena: {item.rating}/5</span> : null}
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200">
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
    </div>
  );
}
