"use client";

import { useId, useState } from "react";

/** Accordion. Each question is a button inside an h3; answers stay in the DOM but hidden when closed. */
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const uid = useId();
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="border-t border-rule">
      {items.map(({ q, a }, i) => {
        const isOpen = open.has(i);
        const qid = `${uid}-q${i}`;
        const aid = `${uid}-a${i}`;
        return (
          <div key={q} className="border-b border-rule">
            <h3 className="m-0">
              <button
                type="button"
                id={qid}
                aria-expanded={isOpen}
                aria-controls={aid}
                onClick={() => toggle(i)}
                className="group/q flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-[19px] font-semibold leading-snug transition-colors hover:text-accent md:text-[24px]"
              >
                <span>{q}</span>
                <span
                  aria-hidden="true"
                  className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color] duration-200 ${isOpen ? "rotate-45 border-accent bg-accent text-on-accent" : "border-rule"}`}
                >
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className="absolute h-3.5 w-px bg-current" />
                </span>
              </button>
            </h3>
            <div id={aid} role="region" aria-labelledby={qid} hidden={!isOpen}>
              <p className="max-w-[62ch] pb-6 text-[17px] text-muted">{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
