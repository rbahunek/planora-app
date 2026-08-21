/** Decorative dotted-grid + radial accent glow that fades into the background. */
export function DotGridBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="dot-grid fade-mask absolute inset-0" />
      <div
        className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 65%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)" }}
      />
    </div>
  );
}
