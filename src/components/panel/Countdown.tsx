"use client";

import { useEffect, useState } from "react";

/** Days, hours and minutes to a deadline. Renders nothing once it has passed. */
export default function Countdown({ target, label, units }: { target: string; label: string; units: { d: string; h: string; m: string } }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const end = Date.parse(target);
  if (now !== null && now >= end) return null;

  let text = "-- -- --";
  if (now !== null) {
    const left = end - now;
    const d = Math.floor(left / 86_400_000);
    const h = Math.floor((left % 86_400_000) / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    text = d > 0 ? `${d}${units.d} ${h}${units.h} ${m}${units.m}` : `${h}${units.h} ${m}${units.m}`;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-[14px] text-muted">{label}</span>
      <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-bg px-3 py-1 font-mono text-[15px] font-medium tabular-nums">
        <span aria-hidden="true" className="ha-pulse h-1.5 w-1.5 rounded-full bg-accent" />
        {text}
      </span>
    </p>
  );
}
