import { accountStatusLabel } from "@/lib/labels";

const STYLES: Record<string, { pill: string; dot: string }> = {
  ACTIVE: { pill: "border-success/30 bg-success/10 text-green-300", dot: "bg-success" },
  INACTIVE: { pill: "border-white/10 bg-white/5 text-fg-muted", dot: "bg-fg-subtle" },
  BLOCKED: { pill: "border-danger/30 bg-danger/10 text-red-300", dot: "bg-danger" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.INACTIVE;
  return (
    <span className={`pill ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {accountStatusLabel(status)}
    </span>
  );
}
