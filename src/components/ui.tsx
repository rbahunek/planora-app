import type { ReactNode } from "react";

/* ---------------------------------------------------------------- Surface */
export function SurfaceCard({
  children,
  className = "",
  interactive = false,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "section" | "li";
}) {
  return (
    <As className={`card ${interactive ? "card-interactive" : ""} ${className}`}>{children}</As>
  );
}

/* ---------------------------------------------------------------- PageHeader */
export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mono text-accent mb-1.5 text-[0.7rem] tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-fg-muted mt-1 text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- EmptyState */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon ? (
        <div className="border-border bg-elevated text-fg-subtle flex h-12 w-12 items-center justify-center rounded-xl border">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="text-fg font-medium">{title}</p>
        {description ? <p className="text-fg-subtle mt-1 text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------- Skeleton */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/* ---------------------------------------------------------------- ProgressBar */
export function ProgressBar({
  value,
  className = "",
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "success";
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fill = tone === "success" ? "bg-success" : "bg-accent";
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-white/6 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- UserAvatar */
const AVATAR_TONES = [
  "bg-accent/15 text-accent",
  "bg-info/15 text-blue-300",
  "bg-success/15 text-green-300",
  "bg-warning/15 text-amber-300",
  "bg-violet-500/15 text-violet-300",
  "bg-pink-500/15 text-pink-300",
];

export function initials(first?: string | null, last?: string | null): string {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  const s = `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
  return s || "?";
}

export function UserAvatar({
  firstName,
  lastName,
  size = 32,
}: {
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
}) {
  const label = initials(firstName, lastName);
  const seed = (label.charCodeAt(0) || 0) + (label.charCodeAt(1) || 0);
  const tone = AVATAR_TONES[seed % AVATAR_TONES.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {label}
    </span>
  );
}

/* ---------------------------------------------------------------- Badges */
const TASK_STATUS_TONE: Record<string, string> = {
  TODO: "border-white/10 bg-white/5 text-fg-muted",
  IN_PROGRESS: "border-accent/30 bg-accent/10 text-accent",
  IN_REVIEW: "border-warning/30 bg-warning/10 text-amber-300",
  DONE: "border-success/30 bg-success/10 text-green-300",
};
const TASK_STATUS_DOT: Record<string, string> = {
  TODO: "bg-fg-subtle",
  IN_PROGRESS: "bg-accent",
  IN_REVIEW: "bg-warning",
  DONE: "bg-success",
};

export function TaskStatusBadge({ name, label }: { name: string; label: string }) {
  return (
    <span className={`pill ${TASK_STATUS_TONE[name] ?? TASK_STATUS_TONE.TODO}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${TASK_STATUS_DOT[name] ?? "bg-fg-subtle"}`} />
      {label}
    </span>
  );
}

const PRIORITY_TONE: Record<string, string> = {
  LOW: "border-white/10 bg-white/5 text-fg-muted",
  MEDIUM: "border-info/30 bg-info/10 text-blue-300",
  HIGH: "border-warning/30 bg-warning/10 text-amber-300",
  CRITICAL: "border-danger/30 bg-danger/10 text-red-300",
};

export function PriorityBadge({ name, label }: { name: string; label: string }) {
  return <span className={`pill ${PRIORITY_TONE[name] ?? PRIORITY_TONE.LOW}`}>{label}</span>;
}
