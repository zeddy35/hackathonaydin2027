"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { alternatesFor, resolveSlug } from "@/lib/routes";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const SECTIONS = ["event", "schedule", "sponsors", "faq"] as const;
type SectionId = (typeof SECTIONS)[number];

export type HeaderLabels = Record<SectionId | "label" | "join" | "joinShort" | "joinShortSr" | "menu" | "close" | "switchTo" | "home" | "themeLight" | "themeDark", string>;

/** Past this many pixels the bar turns into a floating capsule. It never hides. */
const COMPACT_AT = 24;

export default function Header({
  lang,
  labels,
  joinHref,
  mlh,
}: {
  lang: Locale;
  labels: HeaderLabels;
  joinHref: string;
  mlh: { href: string; image: string } | null;
}) {
  const pathname = usePathname() ?? `/${lang}`;
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const links = useRef<Partial<Record<SectionId, HTMLAnchorElement | null>>>({});
  const [pills, setPills] = useState<Partial<Record<SectionId, { x: number; w: number }>>>({});

  // Same page in the other language.
  const other: Locale = lang === "tr" ? "en" : "tr";
  const slug = pathname.split("/")[2];
  const resolved = slug ? resolveSlug(slug) : null;
  const otherHref = alternatesFor(resolved ? resolved.key : "home")[other];
  const remember = () => {
    document.cookie = `lang=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  const sectionHref = (id: SectionId) => (isHome ? `#${id}` : `/${lang}#${id}`);

  // Compact state and scroll progress. Progress is written straight to the element (no re-render).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setCompact(y > COMPACT_AT);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current?.style.setProperty("transform", `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Positions of the nav links, for the sliding hover/active pills (CSS transitions, no animation library).
  useLayoutEffect(() => {
    const measure = () => {
      const next: Partial<Record<SectionId, { x: number; w: number }>> = {};
      for (const id of SECTIONS) {
        const a = links.current[id];
        if (a) next[id] = { x: a.offsetLeft, w: a.offsetWidth };
      }
      setPills(next);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [lang]);

  // Scroll-spy. Watches every home section so the marker clears on sections that are not in the nav.
  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }
    const els = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          setActive((SECTIONS as readonly string[]).includes(id) ? (id as SectionId) : null);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) menuBtn.current?.focus();
  }, []);

  // Mobile menu: Escape, focus trap, scroll lock.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const list = [menuBtn.current, ...focusables()].filter((x): x is HTMLElement => !!x);
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => window.innerWidth >= 768 && close(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  // Close the menu after navigation.
  useEffect(() => setOpen(false), [pathname]);

  const capsule = compact && !open;
  const hoverPill = hovered && hovered !== active ? pills[hovered] : undefined;
  const activePill = active ? pills[active] : undefined;
  const pillStyle = (p?: { x: number; w: number }) => (p ? { transform: `translateX(${p.x}px)`, width: p.w, opacity: 1 } : { opacity: 0 });

  const langSwitch = () => (
    <span className="inline-flex items-center rounded-full border border-rule bg-surface p-0.5 font-mono text-[13px] font-medium">
      {(["tr", "en"] as const).map((l) =>
        lang === l ? (
          <span key={l} aria-current="true" className="inline-flex h-8 min-w-9 items-center justify-center rounded-full bg-accent px-2.5 text-on-accent">
            {l.toUpperCase()}
          </span>
        ) : (
          <Link
            key={l}
            href={otherHref}
            onClick={remember}
            hrefLang={l}
            lang={l}
            className="relative z-10 inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2.5 text-muted transition-colors hover:text-ink"
          >
            {l.toUpperCase()}
            <span className="sr-only">, {labels.switchTo}</span>
          </Link>
        )
      )}
    </span>
  );

  const joinButton = (extra: string, short = false) => (
    <Link href={joinHref} onClick={() => open && close(false)} className={`btn btn-primary group/join active:scale-[0.97] ${extra}`}>
      {short && labels.joinShort !== labels.join ? (
        <>
          <span className="lg:hidden">
            {labels.joinShortSr && <span className="sr-only">{labels.joinShortSr} </span>}
            {labels.joinShort}
          </span>
          <span className="max-lg:hidden">{labels.join}</span>
        </>
      ) : (
        labels.join
      )}
      <span aria-hidden="true" className="hidden transition-transform duration-200 group-hover/join:translate-x-1 min-[380px]:inline">
        →
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-h)] flex-col">
      <div
        className={`relative mx-auto flex items-center gap-2 transition-[max-width,margin,padding,height,background-color,border-color,box-shadow,border-radius] duration-300 ease-out md:gap-4 ${
          capsule
            ? "mt-4 h-14 w-[calc(100%-16px)] max-w-[1080px] rounded-full border border-rule bg-bg/80 px-2 shadow-[0_12px_32px_-12px_var(--shadow)] backdrop-blur-md sm:px-3 md:px-4"
            : `h-[var(--header-h)] w-full max-w-[1200px] rounded-none border border-transparent px-[max(16px,env(safe-area-inset-left))] md:px-8 ${open ? "bg-bg" : "bg-bg/0"}`
        }`}
      >
        <Link href={`/${lang}`} className={`group/logo -mx-1 flex min-h-11 min-w-0 shrink items-center rounded-full px-1 transition-opacity duration-300 max-[430px]:[&_.logo-year]:hidden ${
            isHome && !compact && !open ? "invisible opacity-0" : "opacity-100"
          }`}>
          <Logo />
          <span className="sr-only">, {labels.home}</span>
        </Link>

        {mlh && (
          <a href={mlh.href} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mlh.image} alt="Major League Hacking 2027 Hackathon Season" className="h-10 w-auto" />
          </a>
        )}

        <nav aria-label={labels.label} className="ml-auto hidden md:block">
          <ul className="relative isolate flex items-center" onMouseLeave={() => setHovered(null)}>
            <span aria-hidden="true" style={pillStyle(hoverPill)} className="ha-pill absolute inset-y-1.5 left-0 -z-10 rounded-full bg-ink/[0.06]" />
            <span aria-hidden="true" style={pillStyle(activePill)} className="ha-pill absolute inset-y-1.5 left-0 -z-10 rounded-full bg-accent-tint" />
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  ref={(el) => {
                    links.current[id] = el;
                  }}
                  href={sectionHref(id)}
                  aria-current={active === id ? "location" : undefined}
                  onMouseEnter={() => setHovered(id)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                  className={`relative inline-flex min-h-11 items-center rounded-full px-3 text-[15px] transition-colors lg:px-4 ${
                    active === id ? "text-accent" : "text-muted hover:text-ink"
                  }`}
                >
                  {labels[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
          <span className="hidden md:inline-flex">{langSwitch()}</span>
          <span className="hidden md:inline-flex">
            <ThemeToggle toLight={labels.themeLight} toDark={labels.themeDark} />
          </span>
          {joinButton("min-h-11 rounded-full px-3 py-2 text-[14px] sm:px-4 md:text-[15px]", true)}
          <button
            ref={menuBtn}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-rule bg-surface md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? labels.close : labels.menu}
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-px w-4 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>

        {/* Scroll progress. In the capsule it fills the straight part of the bottom border
            (inset = the capsule's 28 px corner radius), so it reads as the border filling up. */}
        <span
          ref={progress}
          aria-hidden="true"
          style={{ transform: "scaleX(0)" }}
          className={`absolute h-[2px] origin-left bg-accent ${capsule ? "inset-x-7 -bottom-px" : "inset-x-0 bottom-0"} ${open ? "opacity-0" : ""}`}
        />
      </div>

      <div
        ref={panel}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 -z-10 overflow-y-auto bg-bg pt-[calc(var(--header-h)+16px)] md:hidden"
      >
        <nav aria-label={labels.label} className="wrap grid gap-10 pb-[max(32px,env(safe-area-inset-bottom))]">
          <ul className="grid">
            {SECTIONS.map((id, i) => (
              <li key={`${id}-${open}`} style={{ ["--i" as string]: i }} className="ha-menu-item border-b border-rule">
                <a
                  href={sectionHref(id)}
                  onClick={(e) => {
                    // Unlock scrolling first, then jump, so the anchor scroll is not cut short.
                    if (!isHome) return close(false);
                    e.preventDefault();
                    close(false);
                    requestAnimationFrame(() => {
                      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                      history.replaceState(null, "", `#${id}`);
                    });
                  }}
                  aria-current={active === id ? "location" : undefined}
                  className={`poster flex min-h-16 items-center text-[44px] leading-none ${active === id ? "text-accent" : "text-ink"}`}
                >
                  {labels[id]}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {langSwitch()}
            <ThemeToggle toLight={labels.themeLight} toDark={labels.themeDark} />
            {joinButton("min-h-12 flex-1 rounded-full")}
          </div>
        </nav>
      </div>
    </header>
  );
}
