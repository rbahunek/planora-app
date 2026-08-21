"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  triggerLabel: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "accent";
};

/** A destructive-action button that opens a confirmation dialog before submitting. */
export function ConfirmSubmit({
  action,
  hidden = {},
  triggerLabel,
  title,
  description,
  confirmLabel = "Potvrdi",
  tone = "danger",
}: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    confirmRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={tone === "danger" ? "btn btn-danger" : "btn btn-ghost"}
      >
        {triggerLabel}
      </button>

      <AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="glass relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 id="confirm-title" className="text-fg text-lg font-semibold">
                {title}
              </h2>
              {description ? <p className="text-fg-muted mt-2 text-sm">{description}</p> : null}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                  Odustani
                </button>
                <form action={action}>
                  {Object.entries(hidden).map(([k, v]) => (
                    <input key={k} type="hidden" name={k} value={v} />
                  ))}
                  <button
                    ref={confirmRef}
                    type="submit"
                    className={tone === "danger" ? "btn btn-danger" : "btn btn-primary"}
                  >
                    {confirmLabel}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
