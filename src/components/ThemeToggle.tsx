"use client";

import { useEffect, useState } from "react";

export const THEME_KEY = "ha-theme";

/** Inline <head> script: applies a saved "day" choice before first paint. Night is the default. */
export const THEME_SCRIPT = `(function(){try{if(localStorage.getItem('${THEME_KEY}')==='day'){var c=document.documentElement.classList;c.remove('night');c.add('day')}}catch(e){}})();`;

/** Sun / moon button that swaps html.night and html.day and remembers the choice on this device. */
export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const [day, setDay] = useState(false);

  useEffect(() => setDay(document.documentElement.classList.contains("day")), []);

  const flip = () => {
    const next = !day;
    const c = document.documentElement.classList;
    c.toggle("day", next);
    c.toggle("night", !next);
    try {
      localStorage.setItem(THEME_KEY, next ? "day" : "night");
    } catch {}
    setDay(next);
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={day ? toDark : toLight}
      className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-rule bg-surface text-ink transition-colors hover:border-ink"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {day ? (
          <path d="M16.5 11.6A7 7 0 0 1 8.4 3.5a7 7 0 1 0 8.1 8.1Z" fill="currentColor" stroke="none" />
        ) : (
          <>
            <circle cx="10" cy="10" r="3.6" fill="currentColor" stroke="none" />
            <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
