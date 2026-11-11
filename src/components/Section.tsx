import type { ReactNode } from "react";

/**
 * Home page section: heading column on the left on desktop, content on the right.
 * On desktop the heading block sticks below the navbar while the content scrolls.
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
    <section id={id} aria-labelledby={`${id}-h`} className="wrap">
      <div className="grid gap-8 border-t border-rule py-16 md:py-24 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16">
        <div className="grid content-start gap-3 self-start lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <p aria-hidden="true" className="font-mono text-[12px] tracking-[0.06em] text-muted">
            {pad(n)} / {pad(total)}
          </p>
          <h2 id={`${id}-h`} className="display text-[32px] leading-[1.08] md:text-[44px]">
            {title}
          </h2>
          {aside}
        </div>
        <div className="grid min-w-0 content-start gap-10">{children}</div>
      </div>
    </section>
  );
}
