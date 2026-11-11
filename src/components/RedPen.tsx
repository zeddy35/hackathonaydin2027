"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Red pen line over a piece of text, drawn as if by hand.
 *
 * One SVG path per rendered line of text (measured with Range.getClientRects),
 * in pixel coordinates, so the stroke never stretches and covers the text at any
 * width or wrap. Drawing is CSS only (stroke-dashoffset on pathLength="1"), see
 * .ha-pen in globals.css for timing.
 *
 * Before hydration (or without JavaScript) the text falls back to a plain red
 * line-through, so the line is always there.
 */

type Seg = { x: number; y: number; w: number; h: number; d: number; dur: number };

/** Total draw time across all lines, in ms. */
const DRAW_MS = 600;

function wobble(w: number, h: number, seed: number) {
  // Slight upward slant, small wave, ends overshoot the text by a few pixels.
  const over = Math.max(4, h * 0.08);
  const x0 = -over;
  const x1 = w + over;
  const y0 = h * (0.6 + 0.02 * Math.sin(seed));
  const y1 = h * 0.48;
  const a = h * 0.035;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} C${(x0 + (mx - x0) * 0.4).toFixed(1)} ${(y0 - a).toFixed(1)} ${(x0 + (mx - x0) * 0.7).toFixed(1)} ${(my + a).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} S${(mx + (x1 - mx) * 0.7).toFixed(1)} ${(y1 + a).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export default function RedPen({ text }: { text: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const [segs, setSegs] = useState<Seg[] | null>(null);

  useEffect(() => {
    const el = host.current;
    const node = el?.firstChild;
    if (!el || !node) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(node);
      // Merge fragments on the same visual line (one rect per line).
      const lines: { x: number; y: number; r: number; h: number }[] = [];
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 1) continue;
        const top = r.top - box.top;
        const same = lines.find((l) => Math.abs(l.y - top) < r.height / 2);
        if (same) {
          same.x = Math.min(same.x, r.left - box.left);
          same.r = Math.max(same.r, r.right - box.left);
        } else lines.push({ x: r.left - box.left, y: top, r: r.right - box.left, h: r.height });
      }
      const total = lines.reduce((t, l) => t + (l.r - l.x), 0) || 1;
      let acc = 0;
      setSegs(
        lines.map((l) => {
          const w = l.r - l.x;
          const dur = Math.round((DRAW_MS * w) / total);
          const s = { x: l.x, y: l.y, w, h: l.h, d: acc, dur };
          acc += dur;
          return s;
        })
      );
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span ref={host} className="ha-pen-host relative block" data-ready={segs ? "" : undefined}>
      {text}
      {segs?.map((s, i) => (
        <svg
          key={i}
          aria-hidden="true"
          className="ha-pen pointer-events-none absolute overflow-visible"
          style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
          width={s.w}
          height={s.h}
          viewBox={`0 0 ${s.w.toFixed(1)} ${s.h.toFixed(1)}`}
          fill="none"
        >
          <path
            d={wobble(s.w, s.h, i + 1)}
            pathLength={1}
            strokeWidth={Math.max(2, s.h * 0.08)}
            strokeLinecap="round"
            style={{ ["--pd" as string]: `${s.d}ms`, ["--pdur" as string]: `${s.dur}ms` }}
          />
        </svg>
      ))}
    </span>
  );
}
