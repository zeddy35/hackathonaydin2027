/**
 * Ticker band. The first row is the real content; three hidden copies make the
 * loop seamless. With reduced motion the track stands still.
 */
export default function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (copy: number) => (
    <ul key={copy} aria-hidden={copy > 0 || undefined} className="flex shrink-0 items-center">
      {items.map((it) => (
        <li key={it} className="flex items-center whitespace-nowrap">
          <span className="px-5 sm:px-7">{it}</span>
          <span aria-hidden="true" className="text-[0.6em]">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max">{[0, 1, 2, 3].map(row)}</div>
    </div>
  );
}
