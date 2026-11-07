"use client";

import { useEffect, useState } from "react";

type Labels = { label: string; days: string; hours: string; minutes: string; live: string; done: string };

/** Small status line. Minutes resolution; no ticking seconds. */
export default function Countdown({ start, end, labels }: { start: string; end: string; labels: Labels }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const s = Date.parse(start);
  const e = Date.parse(end);

  let text: string;
  let dot = false;
  if (now === null) {
    text = "";
  } else if (now >= e) {
    text = labels.done;
  } else if (now >= s) {
    text = labels.live;
    dot = true;
  } else {
    const mins = Math.floor((s - now) / 60_000);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    text = `${d} ${labels.days} ${h} ${labels.hours} ${m} ${labels.minutes}`;
  }

  const counting = now !== null && now < s;

  return (
    <p className="flex min-h-6 flex-wrap items-baseline gap-x-2 font-mono text-[13px] text-muted">
      {counting && <span>{labels.label}</span>}
      <span className="tabular-nums text-ink">
        {dot && <span aria-hidden="true" className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
        {text}
      </span>
    </p>
  );
}
