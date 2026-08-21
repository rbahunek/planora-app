"use client";

/* eslint-disable react-hooks/set-state-in-effect -- count-up animation writes state over time via rAF */
import { useEffect, useRef, useState, type ReactNode } from "react";

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  hint,
  decimals = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
  hint?: string;
  decimals?: number;
}) {
  const animated = useCountUp(value);
  const shown = animated.toFixed(decimals);

  return (
    <div className="card card-interactive p-5">
      <div className="flex items-start justify-between">
        <p className="text-fg-muted text-sm">{label}</p>
        {icon ? (
          <span className="border-border bg-elevated text-accent flex h-9 w-9 items-center justify-center rounded-lg border">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mono text-fg mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {shown}
        {suffix ? <span className="text-fg-muted ml-1 text-lg">{suffix}</span> : null}
      </div>
      {hint ? <p className="text-fg-subtle mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}
