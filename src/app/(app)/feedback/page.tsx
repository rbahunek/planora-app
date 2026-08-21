import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/dates";
import { listUserFeedback } from "@/server/feedback-service";

import { FeedbackForm } from "./FeedbackForm";

export const metadata: Metadata = { title: "Povratne informacije – Planora" };

const sectionClass = "card flex flex-col gap-4 p-6";

export default async function FeedbackPage() {
  const user = await requireUser();
  const feedback = await listUserFeedback(user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-fg text-2xl font-semibold tracking-tight">Povratne informacije</h1>

      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Nova poruka</h2>
        <FeedbackForm />
      </div>

      <div className={sectionClass}>
        <h2 className="text-fg text-lg font-semibold">Vaše prethodne poruke</h2>
        {feedback.length === 0 ? (
          <p className="text-fg-muted text-sm">Još niste poslali poruke.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {feedback.map((item) => (
              <li key={item.id} className="border-border rounded-md border p-3">
                <div className="text-fg-subtle flex items-center justify-between gap-2 text-xs">
                  <span>{formatDateTime(item.createdAt)}</span>
                  {item.rating ? <span>Ocjena: {item.rating}/5</span> : null}
                </div>
                <p className="text-fg mt-1 text-sm whitespace-pre-wrap">{item.text}</p>
                {item.attachmentUrl ? (
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent mt-1 inline-block text-xs hover:underline"
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
