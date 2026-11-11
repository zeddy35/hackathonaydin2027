"use client";

import { useEffect, useState } from "react";
import type { DocSection } from "@/content/types";

export default function DocNav({ title, sections }: { title: string; sections: DocSection[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label={title} className="hidden lg:block">
      <ul className="sticky top-[calc(var(--header-h)+24px)] grid gap-1 text-[14px]">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={`block py-1 transition-colors ${active === s.id ? "font-medium text-accent" : "text-muted hover:text-ink"}`}
            >
              {s.h}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
