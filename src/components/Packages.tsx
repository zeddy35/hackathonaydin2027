import { packages } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";

/**
 * Sponsorship packages, one card each, listing only what that package includes (with the
 * size or duration when there is one). No side-by-side comparison and no quota row: the
 * first row of the data (the quota) is kept in dict.ts but not shown.
 */
export default function Packages({ lang }: { lang: Locale }) {
  const { head, rows, included } = packages[lang];
  const rights = rows.slice(1);

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {head.map((h, col) => (
        <li key={h} className="grid content-start gap-4 rounded-2xl border border-rule bg-surface p-5">
          <h3 className="poster text-[30px] text-ink">{h}</h3>
          <ul className="grid gap-2.5 text-[15px]">
            {rights
              .filter((r) => r[col + 1] !== "")
              .map((r) => (
                <li key={r[0]} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                  <span className="text-ink">
                    {r[0]}
                    {r[col + 1] === "●" ? <span className="sr-only">: {included}</span> : <span className="text-muted">: {r[col + 1]}</span>}
                  </span>
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
