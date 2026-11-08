"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/lib/dict";

/*
 * "Hacker Pass": a badge-shaped card on the right of the hero with the
 * countdown to the opening ceremony. Decorative QR is not a real code.
 * Tilt follows the mouse (max 6°) on fine pointers only, never with reduced motion.
 */

const MAX_TILT = 6;
const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

// Deterministic 9x9 pattern with three corner markers, so it reads as "QR" without being one.
const QR = (() => {
  const n = 9;
  const cells: boolean[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const corner = (cx: number, cy: number) => x >= cx && x < cx + 3 && y >= cy && y < cy + 3 && !(x === cx + 1 && y === cy + 1);
      const isCorner = corner(0, 0) || corner(6, 0) || corner(0, 6);
      const inCornerZone = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      cells.push(inCornerZone ? isCorner : ((x * 7 + y * 13 + x * y) % 5) < 2);
    }
  }
  return cells;
})();

export default function HackerPass({
  t,
  start,
  end,
  linkHref,
  linkLabel,
}: {
  t: Dict["pass"];
  start: string;
  end: string;
  linkHref: string;
  linkLabel: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  const [canTilt, setCanTilt] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sy = useSpring(ry, { stiffness: 220, damping: 18 });

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCanTilt(fine && !reduce);
    return () => clearInterval(id);
  }, []);

  const s = Date.parse(start);
  const e = Date.parse(end);
  const left = now === null ? null : Math.max(0, s - now);
  const parts =
    left === null
      ? null
      : {
          d: Math.floor(left / 86_400_000),
          h: Math.floor((left % 86_400_000) / 3_600_000),
          m: Math.floor((left % 3_600_000) / 60_000),
          s: Math.floor((left % 60_000) / 1000),
        };
  const phase = now === null || now < s ? "before" : now < e ? "live" : "done";

  return (
    <div className="ha-pass-enter flex justify-center lg:justify-end">
      <div className="relative w-[min(80vw,340px)] rotate-[-3deg] pt-8 lg:rotate-[-5deg] lg:pt-14" style={{ perspective: 900 }}>
        {/* lanyard */}
        <span aria-hidden="true" className="absolute left-1/2 top-0 h-[68px] w-px -translate-x-1/2 bg-ink/25" />
        <motion.div
          style={canTilt ? { rotateX: sx, rotateY: sy } : undefined}
          onPointerMove={(ev) => {
            if (!canTilt) return;
            const r = ev.currentTarget.getBoundingClientRect();
            const px = (ev.clientX - r.left) / r.width - 0.5;
            const py = (ev.clientY - r.top) / r.height - 0.5;
            ry.set(px * 2 * MAX_TILT);
            rx.set(-py * 2 * MAX_TILT);
          }}
          onPointerLeave={() => {
            rx.set(0);
            ry.set(0);
          }}
          onClick={(ev) => {
            if ((ev.target as HTMLElement).closest("a, button")) return;
            link.current?.click();
          }}
          className="relative cursor-pointer overflow-hidden rounded-2xl border border-rule bg-surface shadow-[0_24px_48px_-24px_rgb(23_23_23/0.28),0_2px_6px_rgb(23_23_23/0.06)]"
        >
          {/* lanyard slot */}
          <span aria-hidden="true" className="mx-auto mt-4 block h-2.5 w-14 rounded-full border border-rule bg-bg" />

          <div className="grid gap-3 px-5 pb-4 pt-4 sm:px-6 lg:gap-5 lg:pb-5">
            <p className="label text-accent">{t.label}</p>

            {phase === "before" ? (
              <div role="timer" aria-label={t.countdownLabel}>
                <dl className="flex items-start justify-between gap-2 font-mono">
                  {(["d", "h", "m", "s"] as const).map((k, i) => (
                    <div key={k} className="grid justify-items-start gap-1">
                      <dt className="order-2 text-[10px] tracking-[0.12em] text-muted">{t.units[k]}</dt>
                      <dd className="order-1 text-[clamp(24px,8.5vw,36px)] font-medium leading-none tabular-nums text-ink">
                        {parts ? (k === "d" ? String(parts.d) : pad(parts[k])) : "--"}
                        {i < 3 && <span aria-hidden="true" className="ml-0.5 text-rule">:</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="display text-[32px] leading-tight text-ink">{phase === "live" ? t.live : t.done}</p>
            )}

            <ul className="hidden gap-1.5 font-mono text-[13px] lg:grid">
              {t.facts.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ticket perforation with side notches */}
          <div aria-hidden="true" className="relative mx-0 h-0 border-t border-dashed border-rule">
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-rule bg-bg" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-rule bg-bg" />
          </div>

          <div className="flex items-end justify-end gap-4 px-5 pb-5 pt-4 sm:px-6 lg:justify-between lg:pb-6 lg:pt-5">
            <div aria-hidden="true" className="hidden h-[72px] w-[72px] shrink-0 grid-cols-9 gap-px lg:grid">
              {QR.map((on, i) => (
                <span key={i} className={on ? "bg-accent" : "bg-bg"} />
              ))}
            </div>
            <div className="grid justify-items-end gap-3 text-right">
              <span className="font-mono text-[12px] text-muted">{t.stamp}</span>
              <Link ref={link} href={linkHref} className="btn btn-primary group/pass min-h-11 px-4 py-2 text-[14px] active:scale-[0.97]">
                {linkLabel}
                <span aria-hidden="true" className="transition-transform group-hover/pass:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
