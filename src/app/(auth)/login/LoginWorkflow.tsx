"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";

import { IconProjects, IconTasks } from "@/components/icons";

type Row = {
  kind: "project" | "task";
  code: string;
  name: string;
  status: "U tijeku" | "Na provjeri" | "Završeno" | "Planirano";
  who: string;
  progress: number;
};

const ROWS: Row[] = [
  { kind: "project", code: "PRJ-1", name: "Projekt1", status: "U tijeku", who: "AK", progress: 62 },
  {
    kind: "task",
    code: "TSK-118",
    name: "Implementirati inspekcijski pregled",
    status: "Na provjeri",
    who: "PN",
    progress: 80,
  },
  {
    kind: "project",
    code: "PRJ-2",
    name: "Projekt2",
    status: "Planirano",
    who: "MH",
    progress: 18,
  },
  {
    kind: "task",
    code: "TSK-204",
    name: "Veleprodajni cjenici",
    status: "Završeno",
    who: "IB",
    progress: 100,
  },
  {
    kind: "task",
    code: "TSK-431",
    name: "Planora autentikacija",
    status: "U tijeku",
    who: "SJ",
    progress: 45,
  },
];

const STATUS_TONE: Record<Row["status"], string> = {
  "U tijeku": "border-accent/30 bg-accent/10 text-accent",
  "Na provjeri": "border-warning/30 bg-warning/10 text-amber-300",
  Završeno: "border-success/30 bg-success/10 text-green-300",
  Planirano: "border-white/10 bg-white/5 text-fg-muted",
};
const STATUS_DOT: Record<Row["status"], string> = {
  "U tijeku": "bg-accent",
  "Na provjeri": "bg-warning",
  Završeno: "bg-success",
  Planirano: "bg-fg-subtle",
};

export function LoginWorkflow() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      className="relative w-full max-w-md [perspective:1200px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className="flex flex-col gap-3"
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        {ROWS.map((row, i) => (
          <motion.div
            key={row.code}
            className="card glass flex items-center gap-3 rounded-xl px-3.5 py-3"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, i % 2 === 0 ? -5 : 5, 0] }}
            transition={
              reduce
                ? { duration: 0.3, delay: i * 0.08 }
                : {
                    opacity: { duration: 0.5, delay: 0.15 + i * 0.1 },
                    y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                  }
            }
          >
            <span
              className={`border-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                row.kind === "project" ? "bg-accent/10 text-accent" : "text-fg-muted bg-white/5"
              }`}
            >
              {row.kind === "project" ? <IconProjects size={17} /> : <IconTasks size={17} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="mono text-fg-subtle text-[0.65rem]">{row.code}</span>
                <span className="text-fg truncate text-sm font-medium">{row.name}</span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className={`h-full rounded-full ${row.status === "Završeno" ? "bg-success" : "bg-accent"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${row.progress}%` }}
                  transition={{ duration: 0.9, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>

            <span className={`pill ${STATUS_TONE[row.status]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
              {row.status}
            </span>
            <span
              className="text-fg-muted hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-[0.7rem] font-medium sm:flex"
              aria-hidden
            >
              {row.who}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
