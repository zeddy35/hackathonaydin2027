"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Opening loader: red squares cover the screen and flip, from the centre outwards,
 * to their paper-coloured back faces, revealing the page. The squares line up with
 * the hero grid (same --grid size and origin), so the reveal has no visible seam.
 *
 * - Only when the head script (LOADER_SCRIPT) added html.ha-loader: JavaScript on,
 *   first page of the session, no reduced motion. Server HTML is untouched.
 * - One CSS keyframe; each square only gets an animation-delay. No per-square state.
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
const MAX_SQUARES = 400;

type Square = { x: number; y: number; d: number };

function layout(): { size: number; squares: Square[] } {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--grid")) || 48;
  let size = base;
  while (Math.ceil(w / size + 1) * Math.ceil(h / size + 1) > MAX_SQUARES) size += base;

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
  for (let y = startY; y < h; y += size) {
    for (let x = startX; x < w; x += size) {
      const dist = Math.hypot(x + size / 2 - cx, y + size / 2 - cy);
      const ring = Math.round(dist / size);
      const ringDelay = ((ring * size) / maxDist) * SPREAD_MS;
      squares.push({ x, y, d: WORD_MS + ringDelay + Math.random() * 30 });
    }
  }
  return { size, squares };
}

export default function Loader({ word }: { word: string }) {
  const [grid, setGrid] = useState<{ size: number; squares: Square[] } | null>(null);
  const [out, setOut] = useState(false);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("ha-loader")) {
      setDone(true);
      return;
    }
    const g = layout();
    setGrid(g);
    const total = Math.max(...g.squares.map((s) => s.d)) + FLIP_MS;
    const onResize = () => setGrid(layout());
    window.addEventListener("resize", onResize);
    const t1 = setTimeout(() => setOut(true), total);
    const t2 = setTimeout(() => {
      html.classList.remove("ha-loader");
      html.classList.add("ha-go");
      window.dispatchEvent(new Event("ha:loader-done"));
      setDone(true);
    }, total + 200);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className={`ha-loader-root${out ? " ha-out" : ""}`} data-ready={grid ? "" : undefined} aria-hidden="true">
      {grid?.squares.map((s, i) => (
        <span
          key={i}
          className="ha-sq"
          style={{ left: s.x, top: s.y, width: grid.size, height: grid.size, ["--d" as string]: `${Math.round(s.d)}ms` }}
        >
          <i />
          <i />
        </span>
      ))}
      <span className="ha-loader-word">{word}</span>
    </div>
  );
}
