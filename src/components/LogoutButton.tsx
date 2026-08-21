import { logoutAction } from "@/lib/auth/logout-action";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-none dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Odjava
      </button>
    </form>
  );
}
