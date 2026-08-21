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
      <h1 className="text-fg text-2xl font-semibold tracking-tight">
        Povratne informacije korisnika
      </h1>

      {feedback.length === 0 ? (
        <p className="text-fg-muted">Nema povratnih informacija.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feedback.map((item) => (
            <li key={item.id} className="card p-4">
              <div className="text-fg-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>
                  {item.user.firstName} {item.user.lastName} · {item.user.email}
                </span>
                <span>
                  {formatDateTime(item.createdAt)}
                  {item.rating ? ` · Ocjena: ${item.rating}/5` : ""}
                </span>
              </div>
              <p className="text-fg mt-2 text-sm whitespace-pre-wrap">{item.text}</p>
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
  );
}
