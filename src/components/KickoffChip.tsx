"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/lib/dict";

/** Small mono chip next to the date: days, hours and minutes to the opening ceremony. */
export default function KickoffChip({ t, start, end }: { t: Dict["hero"]["countdown"]; start: string; end: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const s = Date.parse(start);
  const e = Date.parse(end);
  let text = "-- -- --";
  let label: string = t.label;
  if (now !== null) {
    if (now >= e) text = label = t.done;
    else if (now >= s) text = label = t.live;
    else {
      const left = s - now;
      const d = Math.floor(left / 86_400_000);
      const h = Math.floor((left % 86_400_000) / 3_600_000);
      const m = Math.floor((left % 3_600_000) / 60_000);
      text = `${d}${t.units.d} ${h}${t.units.h} ${m}${t.units.m}`;
      label = `${t.label}: ${text}`;
    }
  }

  return (
    <span
      role="timer"
      aria-label={label}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-rule bg-surface px-2.5 py-1 font-mono text-[13px] tabular-nums text-ink"
    >
      <span aria-hidden="true" className="ha-pulse h-1.5 w-1.5 rounded-full bg-accent" />
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
