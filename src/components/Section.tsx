import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** A page section: title on the left, content on the right, one ink rule above. */
export default function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="gutter mx-auto max-w-[1200px] scroll-mt-20">
      <div className="grid gap-8 border-t border-ink py-16 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12 md:py-24">
        <Reveal>
          <h2 id={`${id}-h`} className="display text-[clamp(32px,3.6vw,44px)] leading-[1.05]">
            {title}
          </h2>
        </Reveal>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10">{children}</div>
      </div>
    </section>
  );
}
