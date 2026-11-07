import { packages } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";

/** Package comparison: a table from md up, one list per package on mobile. */
export default function Packages({ lang }: { lang: Locale }) {
  const { head, rows, included } = packages[lang];
  const cell = (c: string) =>
    c === "●" ? (
      <>
        <span aria-hidden="true" className="text-accent">●</span>
        <span className="sr-only">{included}</span>
      </>
    ) : c === "" ? (
      <span aria-hidden="true" className="text-rule">·</span>
    ) : (
      c
    );

  return (
    <div>
      <div className="hidden overflow-hidden rounded-lg border border-rule bg-surface md:block">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-rule">
              <td className="px-5 py-4" />
              {head.map((h) => (
                <th key={h} scope="col" className="px-5 py-4 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, ...vals]) => (
              <tr key={name} className="border-b border-rule last:border-b-0">
                <th scope="row" className="px-5 py-3 text-left font-normal text-muted">
                  {name}
                </th>
                {vals.map((v, i) => (
                  <td key={i} className="px-5 py-3">
                    {cell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {head.map((h, col) => (
          <section key={h} className="rounded-lg border border-rule bg-surface p-5" aria-label={h}>
            <h3 className="text-[18px] font-semibold">{h}</h3>
            <ul className="mt-3 grid gap-2 text-[15px]">
              {rows
                .filter((r) => r[col + 1] !== "")
                .map((r) => (
                  <li key={r[0]} className="flex justify-between gap-4 border-t border-rule pt-2">
                    <span className="text-muted">{r[0]}</span>
                    <span className="text-right">{r[col + 1] === "●" ? included : r[col + 1]}</span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
