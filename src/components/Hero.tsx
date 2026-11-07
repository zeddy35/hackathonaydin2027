"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { KICKOFF, type Dict } from "@/lib/dict";

function useCountdown(target: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = Date.parse(target);
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ d }: { d: Dict["hero"] }) {
  const reduce = useReducedMotion();
  const parts = useCountdown(KICKOFF);
  const live = parts?.every((n) => n === 0);
  const up = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.9, ease } };

  return (
    <section id="top" className="gutter mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1200px] content-center gap-14 py-16">
      <div className="grid">
        <motion.h1 className="display text-[clamp(64px,13vw,184px)] leading-[0.86]" {...up(0.2)}>
          Hackathon
          <br />
          Aydın <span className="font-mono text-[0.42em] font-medium tracking-[-0.04em] text-red align-[0.9em]">2027</span>
        </motion.h1>
      </div>

      <motion.div
        className="grid gap-8 border-t border-ink pt-6 md:grid-cols-[1fr_auto_auto] md:items-end md:gap-12"
        {...up(0.45)}
      >
        <div className="grid gap-1">
          <span className="text-[19px] font-semibold">{d.date}</span>
          <span className="text-[16px] text-muted">{d.place}</span>
        </div>

        <div className="grid gap-2">
          <span className="label">{live ? d.started : d.countLabel}</span>
          <div className="flex gap-5 font-mono tabular-nums" aria-live="off">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid">
                <span className="text-[28px] font-medium leading-none tracking-[-0.02em]">
                  {parts ? String(parts[i]).padStart(2, "0") : "--"}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted">{d.units[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 md:justify-items-end">
          <a
            href="#about"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-red px-6 py-3.5 text-[15px] font-semibold text-on-red transition hover:brightness-110"
          >
            {d.cta}
          </a>
          <span className="text-[13px] text-muted">{d.note}</span>
        </div>
      </motion.div>
    </section>
  );
}
