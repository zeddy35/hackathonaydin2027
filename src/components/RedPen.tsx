"use client";

import { useEffect, useRef, useState } from "react";

type Box = { x: number; y: number; w: number; h: number };

/**
 * A hand-drawn looking stroke across a box of w x h pixels: it starts and ends a little
 * outside the text, rises slightly to the right and wobbles. `k` varies the wobble per line.
 */
function stroke(w: number, h: number, k: number) {
  const over = Math.min(12, h * 0.3);
  const x0 = -over;
  const span = w + over * 2;
  const base = h * (k % 2 ? 0.6 : 0.56);
  const rise = h * 0.13;
  const amp = h * 0.07 * (k % 2 ? -1 : 1);
  const pts = [
    [0, 0],
    [0.27, -amp],
    [0.62, amp * 0.8],
    [1, -amp * 0.4],
  ].map(([t, dy]) => [x0 + span * t, base - rise * (t - 0.5) + dy]);
  // Catmull-Rom through the points, written as cubic Béziers.
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Text struck through with a red pen. The stroke is an inline SVG path per visual line
 * (so a line that wraps on a phone gets one stroke per row), measured from the text itself.
 * Decoration only: the caller hides the whole line from screen readers. Styles and the
 * draw animation live in globals.css (.pen, .pen-stroke).
 */
export default function RedPen({ children, className = "" }: { children: string; className?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<Box[] | null>(null);
  const [weight, setWeight] = useState(4);

  useEffect(() => {
    const el = host.current;
    const node = text.current;
    if (!el || !node) return;
    const measure = () => {
      const origin = el.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(node);
      const rows: Box[] = [];
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 1) continue;
        const last = rows[rows.length - 1];
        const y = r.top - origin.top;
        // Rects on the same row are merged into one stroke.
        if (last && Math.abs(last.y - y) < r.height / 2) last.w = r.right - origin.left - last.x;
        else rows.push({ x: r.left - origin.left, y, w: r.width, h: r.height });
      }
      setLines(rows);
      setWeight(Math.max(3, parseFloat(getComputedStyle(node).fontSize) * 0.11));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [children]);

  return (
    <span ref={host} className={`pen block ${lines ? "pen-ready" : ""} ${className}`}>
      <span ref={text}>{children}</span>
      {lines?.map((l, i) => (
        <svg
          key={i}
          aria-hidden="true"
          className="pen-stroke"
          width={l.w}
          height={l.h}
          viewBox={`0 0 ${l.w} ${l.h}`}
          style={{ left: l.x, top: l.y, ["--n" as string]: i }}
        >
          <path d={stroke(l.w, l.h, i)} pathLength={1} strokeWidth={weight} />
        </svg>
      ))}
    </span>
  );
}
