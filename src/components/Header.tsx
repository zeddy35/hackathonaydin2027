"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { alternatesFor, resolveSlug } from "@/lib/routes";
import Logo from "./Logo";

const SECTIONS = ["event", "schedule", "sponsors", "faq"] as const;
type SectionId = (typeof SECTIONS)[number];

export type HeaderLabels = Record<SectionId | "label" | "join" | "menu" | "close" | "switchTo" | "home", string>;

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
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Same page in the other language.
  const other: Locale = lang === "tr" ? "en" : "tr";
  const slug = pathname.split("/")[2];
  const resolved = slug ? resolveSlug(slug) : null;
  const otherHref = alternatesFor(resolved ? resolved.key : "home")[other];
  const remember = () => {
    document.cookie = `lang=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  const sectionHref = (id: SectionId) => (isHome ? `#${id}` : `/${lang}#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }
    // Watch every home section so the marker clears on sections that are not in the nav.
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
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
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
    const onResize = () => window.innerWidth >= 1024 && close(false);
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

  const solid = scrolled || open;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        solid ? "border-rule bg-bg" : "border-transparent bg-bg"
      }`}
    >
      <div className="wrap flex h-[var(--header-h)] items-center gap-4">
        <Link href={`/${lang}`} className="-mx-1 flex min-h-11 min-w-0 items-center rounded-md px-1">
          <Logo />
          <span className="sr-only">, {labels.home}</span>
        </Link>

        {mlh && (
          <a href={mlh.href} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mlh.image} alt="Major League Hacking 2027 Hackathon Season" className="h-10 w-auto" />
          </a>
        )}

        <nav aria-label={labels.label} className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={sectionHref(id)}
                  aria-current={active === id ? "true" : undefined}
                  className={`relative inline-flex min-h-11 items-center rounded-md px-3 text-[15px] transition-colors ${
                    active === id ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {labels[id]}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-1.5 h-px bg-accent transition-opacity ${active === id ? "opacity-100" : "opacity-0"}`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-4">
          <Link
            href={otherHref}
            onClick={remember}
            hrefLang={other}
            lang={other}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 font-mono text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            {/* Small screens: only the language you can switch to. */}
            <span className="sm:hidden">{other.toUpperCase()}</span>
            <span className="hidden sm:inline">
              <span className={lang === "tr" ? "text-ink" : ""}>TR</span>
              <span className="px-1 text-rule">/</span>
              <span className={lang === "en" ? "text-ink" : ""}>EN</span>
            </span>
            <span className="sr-only">, {labels.switchTo}</span>
          </Link>
          <Link href={joinHref} className="btn btn-primary hidden lg:inline-flex">
            {labels.join}
          </Link>
          <button
            ref={menuBtn}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-rule bg-surface px-3 text-[15px] font-medium lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-px w-4 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-px w-4 bg-ink transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
            <span className="sr-only sm:not-sr-only">{open ? labels.close : labels.menu}</span>
          </button>
        </div>
      </div>

      <div
        ref={panel}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto border-t border-rule bg-bg lg:hidden"
      >
        <nav aria-label={labels.label} className="wrap py-6">
          <ul className="grid">
            {SECTIONS.map((id) => (
              <li key={id} className="border-b border-rule">
                <a
                  href={sectionHref(id)}
                  onClick={() => close(false)}
                  className="flex min-h-14 items-center text-[22px] font-medium tracking-[-0.01em]"
                >
                  {labels[id]}
                </a>
              </li>
            ))}
          </ul>
          <Link href={joinHref} onClick={() => close(false)} className="btn btn-primary mt-8 w-full">
            {labels.join}
          </Link>
        </nav>
      </div>
    </header>
  );
}
