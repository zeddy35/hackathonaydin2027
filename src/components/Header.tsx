"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/lib/dict";

const IDS = ["about", "schedule", "sponsors", "last", "faq"] as const;

export default function Header({ nav, lang }: { nav: Dict["nav"]; lang: Locale }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const els = IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const other: Locale = lang === "en" ? "tr" : "en";
  const remember = (l: Locale) => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; };

  return (
    <>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top,0px)] bg-paper" />
      <header
        className={`sticky top-[env(safe-area-inset-top,0px)] z-40 transition-colors duration-300 ${
          scrolled ? "bg-paper/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="gutter mx-auto flex h-16 max-w-[1200px] items-center gap-6">
          <a href="#top" className="flex shrink-0 items-baseline gap-1.5" aria-label="Hackathon Aydın 2027">
            <span className="display text-[20px] leading-none">Hackathon Aydın</span>
            <span className="font-mono text-[13px] font-medium text-red">2027</span>
          </a>
          <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 lg:flex">
            {IDS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`relative rounded-md px-3 py-2 text-[14px] transition-colors ${
                  active === id ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active === id && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute left-1/2 top-[30px] h-1 w-1 -translate-x-1/2 rounded-full bg-red"
                  />
                )}
                {nav[id]}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 lg:ml-2">
            <Link
              href={`/${other}`}
              onClick={() => remember(other)}
              className="rounded-sm border border-rule px-2.5 py-1.5 font-mono text-[12px] tracking-[0.06em] text-muted transition-colors hover:border-ink hover:text-ink"
              aria-label={other === "tr" ? "Türkçe" : "English"}
              hrefLang={other}
            >
              {other.toUpperCase()}
            </Link>
            <a
              href="#about"
              className="hidden rounded-md bg-red px-4 py-2 text-[14px] font-semibold text-on-red transition hover:brightness-110 sm:inline-block"
            >
              {nav.apply}
            </a>
          </div>
        </div>
        <div className={`relative h-px transition-colors ${scrolled ? "bg-rule" : "bg-transparent"}`}>
          <motion.div style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-red" />
        </div>
      </header>
    </>
  );
}
