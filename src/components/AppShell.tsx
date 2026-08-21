"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";

import { PlanoraWordmark } from "@/components/Brand";
import { logoutAction } from "@/lib/auth/logout-action";
import { UserAvatar } from "@/components/ui";
import {
  IconAudit,
  IconDashboard,
  IconFeedback,
  IconLogout,
  IconMenu,
  IconProjects,
  IconTag,
  IconTasks,
  IconTeams,
  IconTime,
  IconUsers,
} from "@/components/icons";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "TESTER" | string;
type Access = "all" | "manager" | "admin";
type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  access: Access;
};

const NAV: { heading?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Nadzorna ploča", icon: IconDashboard, access: "all" },
      { href: "/projekti", label: "Projekti", icon: IconProjects, access: "all" },
      { href: "/timovi", label: "Timovi", icon: IconTeams, access: "all" },
      { href: "/zadaci", label: "Zadaci", icon: IconTasks, access: "all" },
      { href: "/vrijeme", label: "Evidencija vremena", icon: IconTime, access: "all" },
      { href: "/feedback", label: "Povratne informacije", icon: IconFeedback, access: "all" },
      { href: "/oznake", label: "Oznake", icon: IconTag, access: "manager" },
    ],
  },
  {
    heading: "Administracija",
    items: [
      { href: "/admin/korisnici", label: "Korisnici", icon: IconUsers, access: "admin" },
      { href: "/admin/feedback", label: "Povratne info.", icon: IconFeedback, access: "admin" },
      { href: "/admin/dnevnik", label: "Audit log", icon: IconAudit, access: "admin" },
    ],
  },
];

function canSee(access: Access, role: Role): boolean {
  if (access === "all") return true;
  if (access === "admin") return role === "ADMIN";
  return role === "ADMIN" || role === "PROJECT_MANAGER";
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function pageTitle(pathname: string): string {
  for (const group of NAV) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return item.label;
    }
  }
  return "Planora";
}

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
    setMobileOpen(false);
  }, [pathname]);

  const groups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => canSee(i.access, user.role)),
  })).filter((g) => g.items.length > 0);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-1">
        <PlanoraWordmark size={30} />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            {group.heading ? (
              <p className="mono text-fg-subtle px-3 pb-1 text-[0.62rem] tracking-[0.18em] uppercase">
                {group.heading}
              </p>
            ) : null}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="border-accent/25 bg-accent/10 absolute inset-0 rounded-lg border"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 transition-transform group-hover:scale-110 ${active ? "text-accent" : ""}`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-border bg-elevated rounded-xl border p-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            firstName={user.name?.split(" ")[0]}
            lastName={user.name?.split(" ").slice(1).join(" ") || user.email || "?"}
            size={36}
          />
          <div className="min-w-0 flex-1">
            <p className="text-fg truncate text-sm font-medium">{user.name}</p>
            <p className="mono text-fg-subtle truncate text-[0.68rem]">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button type="submit" className="btn btn-ghost w-full text-sm">
            <IconLogout size={16} />
            Odjava
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Desktop sidebar */}
      <aside className="border-border bg-elevated/60 fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="border-border bg-elevated absolute inset-y-0 left-0 w-72 max-w-[82vw] border-r"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {sidebar}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Content column */}
      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-20 flex items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Otvori izbornik"
            className="btn btn-ghost -ml-1 px-2 lg:hidden"
          >
            <IconMenu size={18} />
          </button>
          <h1 className="text-fg-muted text-sm font-medium">{pageTitle(pathname)}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-fg-muted hidden text-sm sm:inline">{user.name}</span>
            <UserAvatar
              firstName={user.name?.split(" ")[0]}
              lastName={user.name?.split(" ").slice(1).join(" ") || "?"}
              size={30}
            />
          </div>
        </header>

        <motion.main
          key={pathname}
          className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
