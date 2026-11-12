"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/lib/dict";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Big countdown to the opening ceremony: days, hours, minutes, seconds.
 * Server HTML shows dashes; the numbers appear after hydration. The accessible
 * label leaves the seconds out so it does not change every tick.
 */
export default function Countdown({ t, start, end }: { t: Dict["hero"]["countdown"]; start: string; end: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = Date.parse(start);
  const e = Date.parse(end);
  const state = now === null ? "wait" : now >= e ? "done" : now >= s ? "live" : "run";
  const left = state === "run" && now !== null ? s - now : 0;
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const sec = Math.floor((left % 60_000) / 1000);

  const label =
    state === "done" ? t.done : state === "live" ? t.live : state === "run" ? `${t.label}: ${d}${t.units.d} ${h}${t.units.h} ${m}${t.units.m}` : t.label;
  const cells = [
    { v: state === "run" ? String(d) : "--", l: t.cells.d },
    { v: state === "run" ? pad(h) : "--", l: t.cells.h },
    { v: state === "run" ? pad(m) : "--", l: t.cells.m },
    { v: state === "run" ? pad(sec) : "--", l: t.cells.s },
  ];

  return (
    <div role="timer" aria-label={label} className="grid gap-3">
      <p aria-hidden="true" className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
        <span className="ha-pulse h-2 w-2 rounded-full bg-accent" />
        {t.label}
      </p>
      {state === "live" || state === "done" ? (
        <p aria-hidden="true" className="poster text-[clamp(40px,6vw,72px)] text-accent">
          {state === "live" ? t.live : t.done}
        </p>
      ) : (
        <div aria-hidden="true" className="flex items-start gap-3 sm:gap-4">
          {cells.map((c, i) => (
            <div key={c.l} className="flex items-start gap-3 sm:gap-4">
              {i > 0 && <span className="poster text-[clamp(28px,7vw,48px)] leading-[1.15] text-rule lg:text-[clamp(32px,3.4vw,52px)]">:</span>}
              <div className="grid justify-items-start gap-1.5">
                <span className={`poster text-[clamp(36px,9vw,60px)] leading-none tabular-nums lg:text-[clamp(40px,4.2vw,64px)] ${i === 3 ? "text-accent" : "text-ink"}`}>
                  {c.v}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:text-[11px]">{c.l}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
