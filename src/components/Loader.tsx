"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Opening loader: red squares cover the screen and flip, from the centre outwards,
 * to their paper-coloured back faces, revealing the page. The squares line up with
 * the hero grid (same --grid origin, size a multiple of --grid), so the reveal has no seam.
 *
 * Drawn on one <canvas> with requestAnimationFrame. The flip is 2D: each square's
 * width follows |cos| of the angle and its colour switches at the half-way point.
 * One element and no per-square DOM keeps style/layout work off the main thread
 * (the old version had hundreds of 3D-transformed spans).
 *
 * - Only when the head script (LOADER_SCRIPT) added html.ha-loader: JavaScript on,
 *   first page of the session, no reduced motion. Server HTML is untouched.
 * - When done: html.ha-loader is removed, html.ha-go starts the hero entrance and a
 *   "ha:loader-done" event is dispatched.
 */

export const LOADER_KEY = "ha-loader-seen";

/** Inline <head> script. Runs before first paint. */
export const LOADER_SCRIPT = `(function(){try{var d=document.documentElement;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce)return;d.classList.add('ha-anim');
var seen=null;try{seen=sessionStorage.getItem('${LOADER_KEY}')}catch(e){}
if(!seen){d.classList.add('ha-loader');try{sessionStorage.setItem('${LOADER_KEY}','1')}catch(e){}}
else{d.classList.add('ha-go')}
setTimeout(function(){d.classList.remove('ha-loader');d.classList.add('ha-go')},3000);
}catch(e){}})();`;

const FLIP_MS = 350;
const WORD_MS = 300;
const SPREAD_MS = 750; // last ring starts this long after the first one
/** Square budget: small screens get bigger squares (still a multiple of --grid). */
const maxSquares = (w: number) => (w < 768 ? 80 : 250);

type Square = { x: number; y: number; d: number };
type Grid = { size: number; squares: Square[]; total: number };

function layout(): Grid {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--grid")) || 48;
  let size = base;
  while (Math.ceil(w / size + 1) * Math.ceil(h / size + 1) > maxSquares(w)) size += base;

  // Align to the hero grid origin (top-left of the hero section).
  const hero = document.getElementById("top")?.getBoundingClientRect();
  const ox = (((hero?.left ?? 0) % size) + size) % size;
  const oy = (((hero?.top ?? 0) % size) + size) % size;
  const startX = ox ? ox - size : 0;
  const startY = oy ? oy - size : 0;

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy) + size;
  const squares: Square[] = [];
  let last = 0;
  for (let y = startY; y < h; y += size) {
    for (let x = startX; x < w; x += size) {
      const dist = Math.hypot(x + size / 2 - cx, y + size / 2 - cy);
      const ring = Math.round(dist / size);
      const d = WORD_MS + ((ring * size) / maxDist) * SPREAD_MS + Math.random() * 30;
      if (d > last) last = d;
      squares.push({ x, y, d });
    }
  }
  return { size, squares, total: last + FLIP_MS };
}

/** Same curve as the old CSS flip: cubic-bezier(0.65, 0, 0.35, 1), close enough as easeInOutCubic. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Loader({ word }: { word: string }) {
  const [active, setActive] = useState(false);
  const [out, setOut] = useState(false);
  const [done, setDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("ha-loader")) {
      setDone(true);
      return;
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const css = getComputedStyle(html);
    const red = css.getPropertyValue("--accent").trim() || "#8a0303";
    const paper = css.getPropertyValue("--bg").trim() || "#fafaf8";
    const line = css.getPropertyValue("--grid-line").trim() || "rgb(23 23 23 / 0.045)";

    let grid = layout();
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(window.innerWidth * dpr);
      el.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const onResize = () => {
      grid = layout();
      size();
    };
    window.addEventListener("resize", onResize);

    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = now - start;
      const s = grid.size;
      // Paper underneath: the gap beside a square mid-flip shows the page colour.
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      for (const q of grid.squares) {
        const p = ease(Math.min(1, Math.max(0, (t - q.d) / FLIP_MS)));
        const scale = Math.abs(Math.cos(p * Math.PI));
        const back = p >= 0.5;
        const wq = s * scale;
        const x = q.x + (s - wq) / 2;
        ctx.fillStyle = back ? paper : red;
        // +0.5 px overlap so neighbouring red squares never show hairline gaps.
        ctx.fillRect(x, q.y, wq + (back ? 0 : 0.5), s + (back ? 0 : 0.5));
        if (back) {
          // Back face carries the hero grid line on its top and left edges.
          ctx.fillStyle = line;
          ctx.fillRect(x, q.y, wq, 1);
          ctx.fillRect(x, q.y, Math.min(1, wq), s);
        }
      }
      if (t < grid.total) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const t1 = setTimeout(() => setOut(true), grid.total);
    const t2 = setTimeout(() => {
      html.classList.remove("ha-loader");
      html.classList.add("ha-go");
      window.dispatchEvent(new Event("ha:loader-done"));
      setDone(true);
    }, grid.total + 200);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  if (done) return null;

  return (
    <div className={`ha-loader-root${out ? " ha-out" : ""}`} aria-hidden="true">
      <canvas ref={canvas} className="ha-loader-canvas" />
      <span className="ha-loader-word">{word}</span>
    </div>
  );
}
