"use client";

import { useFormStatus } from "react-dom";

export function FormField({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-700 focus:ring-2 focus:ring-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
    >
      {pending ? "Molimo pričekajte…" : children}
    </button>
  );
}

export function Alert({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success";
}) {
  const styles =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      : "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200";
  return (
    <div role="alert" className={`rounded-md border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}
