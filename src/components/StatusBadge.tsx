import { accountStatusLabel } from "@/lib/labels";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  INACTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.INACTIVE;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {accountStatusLabel(status)}
    </span>
  );
}
