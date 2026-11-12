import type { ReactNode } from "react";

/**
 * Home page section: a counter, a poster-size title that slides in as it enters
 * the screen, then the content below at full width.
 */
export default function Section({
  id,
  title,
  n,
  total,
  aside,
  children,
}: {
  id: string;
  title: string;
  /** 1-based position among the numbered home sections. */
  n: number;
  total: number;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="wrap [overflow-x:clip]">
      <div className="grid gap-10 border-t border-rule py-20 md:gap-14 md:py-28">
        <div className="grid gap-4">
          <p aria-hidden="true" className="flex items-center gap-3 font-mono text-[12px] tracking-[0.14em] text-muted">
            <span className="text-accent">{pad(n)}</span>
            <span className="h-px w-10 bg-rule" />
            <span>{pad(total)}</span>
          </p>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <h2 id={`${id}-h`} className="poster reveal-x max-w-[14ch] text-[clamp(44px,9vw,124px)] leading-[0.98]">
              {title}
            </h2>
            {aside}
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-12">{children}</div>
      </div>
    </section>
  );
}
