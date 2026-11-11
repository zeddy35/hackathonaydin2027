export type StepState = "done" | "current" | "todo" | "stopped";
export type Step = { label: string; note?: string; state: StepState };

/**
 * Application progress: vertical on phones, horizontal from md up.
 * State is always written out (visible note or screen reader text), never color only.
 */
export default function Stepper({ steps, label, stateLabels }: { steps: Step[]; label: string; stateLabels: Record<StepState, string> }) {
  return (
    <nav aria-label={label}>
      <ol className="grid gap-0 md:grid-cols-5 md:gap-3">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const dot =
            s.state === "done"
              ? "border-ink bg-ink text-white"
              : s.state === "current"
                ? "border-accent bg-accent text-on-accent ring-4 ring-accent-tint"
                : s.state === "stopped"
                  ? "border-muted bg-surface text-muted"
                  : "border-rule bg-surface text-muted";
          return (
            <li
              key={s.label}
              aria-current={s.state === "current" ? "step" : undefined}
              className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 pb-5 last:pb-0 md:grid-cols-1 md:gap-2 md:pb-0"
            >
              {/* connector line: down on phones, right on desktop */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-[calc(100%-32px)] w-0.5 md:left-8 md:top-[15px] md:h-0.5 md:w-[calc(100%-20px)] ${
                    s.state === "done" ? "bg-ink" : "bg-rule"
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 font-mono text-[13px] font-medium ${dot}`}
              >
                {s.state === "done" ? "✓" : s.state === "stopped" ? "–" : i + 1}
              </span>
              <span className="grid content-start gap-0.5 pt-1 md:pt-0">
                <span className={`text-[15px] font-semibold leading-tight ${s.state === "todo" ? "text-muted" : "text-ink"}`}>{s.label}</span>
                <span className="sr-only">, {stateLabels[s.state]}</span>
                {s.note && <span className="text-[13px] leading-snug text-muted">{s.note}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
