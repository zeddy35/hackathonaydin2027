"use client";

import { useRef, useState } from "react";
import type { ScheduleItem } from "@/data/types";
import type { Locale } from "@/lib/i18n";

/** The ruler runs from Saturday 09:00 to Sunday 19:00, one bar per hour. */
const FROM = 9;
const HOURS = 34;
const COLS = { gridTemplateColumns: `repeat(${HOURS}, minmax(0, 1fr))` };
/** The three clock labels under the ruler, as hours from its start (12:00, 00:00, 12:00). */
const TICKS = [3, 15, 27];
const hourOf = (i: Pick<ScheduleItem, "day" | "time">) => {
  const [h, m] = i.time.split(":").map(Number);
  return (i.day === "sun" ? 24 : 0) + h + m / 60 - FROM;
};
const clock = (h: number) => `${String((h + FROM) % 24).padStart(2, "0")}:00`;

/**
 * The weekend as an hour ruler you can scrub: move the pointer, drag a finger or use
 * the arrow keys, and the readout shows that hour, which build hour it is, and what is
 * on the programme then. The 24 build hours are the tall bars; a dot marks hours that
 * have a programme item. One tab stop (a slider); the lists below hold the full data.
 */
export default function BuildRuler({
  items,
  lang,
  t,
}: {
  items: ScheduleItem[];
  lang: Locale;
  t: { build: string; hour: string; days: { sat: string; sun: string } };
}) {
  const start = items.find((i) => i.key === "hackStart");
  const end = items.find((i) => i.key === "submit");
  const a = start ? Math.round(hourOf(start)) : 0;
  const b = end ? Math.round(hourOf(end)) : 0;
  const [active, setActive] = useState(a);
  const track = useRef<HTMLDivElement>(null);
  if (!start || !end) return null;

  const at = (h: number) => items.filter((i) => Math.floor(hourOf(i)) === h);
  const pick = (x: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    setActive(Math.min(HOURS - 1, Math.max(0, Math.floor(((x - r.left) / r.width) * HOURS))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? active + 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? active - 1 : e.key === "Home" ? 0 : e.key === "End" ? HOURS - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(Math.min(HOURS - 1, Math.max(0, next)));
  };

  const inBuild = active >= a && active < b;
  const day = (active + FROM >= 24 ? t.days.sun : t.days.sat).split(",")[0];
  const now = at(active);
  const what = now.map((i) => `${i.time} ${i[lang]}`).join(" · ");
  const nth = inBuild ? `${t.hour.replace("{n}", String(active - a + 1))} / ${b - a}` : "";

  return (
    <div className="reveal grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <p className="poster text-[clamp(34px,6.4vw,84px)] text-amber">{t.build}</p>
        <div aria-hidden="true" className="grid min-h-[96px] content-end gap-1.5 md:justify-items-end md:text-right">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="poster text-[56px] leading-[0.85] tabular-nums text-ink md:text-[72px]">{clock(active)}</span>
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted sm:text-[13px]">
              {day}
              {nth && <span className="text-accent"> · {nth}</span>}
            </span>
          </p>
          <p className="min-h-[26px] text-[17px] font-medium text-ink">{what || " "}</p>
        </div>
      </div>

      <div>
        <div
          ref={track}
          role="slider"
          tabIndex={0}
          aria-label={t.build}
          aria-valuemin={0}
          aria-valuemax={HOURS - 1}
          aria-valuenow={active}
          aria-valuetext={[day, clock(active), nth, what].filter(Boolean).join(", ")}
          onPointerDown={(e) => pick(e.clientX)}
          onPointerMove={(e) => pick(e.clientX)}
          onKeyDown={onKey}
          className="grid h-24 cursor-crosshair touch-pan-y select-none items-end gap-x-[2px] rounded-sm sm:h-32 sm:gap-x-1"
          style={COLS}
        >
          {Array.from({ length: HOURS }, (_, h) => {
            const on = h >= a && h < b;
            const act = h === active;
            const size = on ? (act ? "h-full" : "h-[80%]") : act ? "h-1/2" : "h-1/4";
            const fill = act ? "bg-ink" : on ? "bg-accent" : "bg-ink/25";
            return (
              <span key={h} className={`relative transition-[height,background-color] duration-150 ease-out ${size} ${fill}`}>
                {at(h).length > 0 && (
                  <span className={`absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${act || !on ? "bg-accent" : "bg-on-accent"}`} />
                )}
              </span>
            );
          })}
        </div>
        <div aria-hidden="true" className="relative mt-3 h-8">
          {TICKS.map((h) => (
            <span key={h} className="poster absolute top-0 text-[24px] leading-none tabular-nums text-ink sm:text-[30px]" style={{ left: `${(h / HOURS) * 100}%` }}>
              {clock(h)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
