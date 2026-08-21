"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function FormField({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
  defaultValue,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}) {
  const isPassword = type === "password";
  const [reveal, setReveal] = useState(false);
  const effectiveType = isPassword && reveal ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={effectiveType}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`input ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Sakrij lozinku" : "Prikaži lozinku"}
            aria-pressed={reveal}
            className="text-fg-subtle hover:text-fg absolute inset-y-0 right-0 flex items-center px-3 transition"
          >
            {reveal ? <EyeOff /> : <Eye />}
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-fg-subtle text-xs">{hint}</p> : null}
    </div>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}
    >
      {pending ? (
        <>
          <Spinner />
          Molimo pričekajte…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Alert({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success" | "info" | "warning";
}) {
  const map: Record<string, string> = {
    error: "border-danger/30 bg-danger/10 text-red-300",
    success: "border-success/30 bg-success/10 text-green-300",
    info: "border-info/30 bg-info/10 text-blue-300",
    warning: "border-warning/30 bg-warning/10 text-amber-300",
  };
  return (
    <div role="alert" className={`rounded-xl border px-3.5 py-2.5 text-sm ${map[tone]}`}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function Eye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.5M6.6 6.6C3.6 8.3 2 11 2 11s3.5 7 10 7a9.3 9.3 0 0 0 4.4-1.1" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
