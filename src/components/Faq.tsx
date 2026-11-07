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
                className="flex min-h-14 w-full items-center justify-between gap-6 py-4 text-left text-[17px] font-medium leading-snug"
              >
                <span>{q}</span>
                <span
                  aria-hidden="true"
                  className={`relative h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                >
                  <span className="absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 bg-ink" />
                  <span className="absolute left-1/2 top-0 h-3.5 w-px -translate-x-1/2 bg-ink" />
                </span>
              </button>
            </h3>
            <div id={aid} role="region" aria-labelledby={qid} hidden={!isOpen}>
              <p className="max-w-[62ch] pb-5 text-[16px] text-muted">{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
