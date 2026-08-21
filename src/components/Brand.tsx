/** Original Planora geometric mark: stacked layers with a connecting node. */
export function PlanoraMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="#0b0e10"
        stroke="rgba(255,255,255,0.1)"
      />
      <path
        d="M11 27V13h8a5 5 0 0 1 0 10h-8"
        stroke="#12bfd1"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27.5" cy="14" r="2.4" fill="#12bfd1" />
      <circle cx="27.5" cy="14" r="5" stroke="#12bfd1" strokeOpacity="0.35" strokeWidth="1.4" />
    </svg>
  );
}

export function PlanoraWordmark({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <PlanoraMark size={size} />
      <span className="text-fg text-xl font-semibold tracking-tight">
        Plan<span className="text-accent">ora</span>
      </span>
    </div>
  );
}
