import Link from "next/link";
import { schedule } from "@/data/schedule";
import { sponsorItems } from "@/data/sponsor-items";
import type { Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";

/**
 * "Take on one item": the parts of the event open to a sponsor, as cards. Each card has the
 * item, one sentence on what the sponsor gets, and either "open" or the sponsor's name;
 * items with a programme line show its day and time. On phones a card is a compact row
 * (title and tag side by side). The last cell invites other ideas and, on the home page,
 * links to the packages. `wide` is the home page (four columns); the partner page column
 * is narrower and stays at two.
 */
export default function SponsorItems({
  lang,
  d,
  contactHref,
  packagesHref,
  wide = false,
}: {
  lang: Locale;
  d: Dict;
  contactHref: string;
  packagesHref?: string;
  wide?: boolean;
}) {
  const t = d.sponsors.items;
  const when = (slot?: string) => {
    const s = slot && schedule.find((i) => i.key === slot);
    return s ? `${d.schedule.days[s.day].split(",")[0]} ${s.time}` : null;
  };

  return (
    <div className="grid gap-5">
      <p className="max-w-[60ch] border-l-2 border-accent pl-4 text-[16px] text-ink">{t.credit}</p>
      <ul className={`grid gap-2.5 sm:grid-cols-2 sm:gap-3 ${wide ? "lg:grid-cols-4" : ""}`}>
        {sponsorItems.map((it, i) => {
          const time = when(it.slot);
          return (
            <li key={it.key} className="grid content-start gap-2 rounded-2xl border border-rule bg-surface p-4 sm:gap-3 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid gap-2">
                  <span aria-hidden="true" className="font-mono text-[12px] tracking-[0.14em] text-accent-ink max-sm:hidden">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="poster text-[22px] leading-[1.04] text-ink sm:text-[26px]">{it[lang]}</span>
                </span>
                {it.by ? (
                  <span className="text-right text-[14px] font-semibold text-ink">
                    <span className="sr-only">{t.takenBy}: </span>
                    {it.by}
                  </span>
                ) : (
                  <span className="tag shrink-0">{t.open}</span>
                )}
              </div>
              <p className="text-[14px] leading-snug text-muted sm:text-[15px]">{it.p[lang]}</p>
              {time && (
                <p className="font-mono text-[12px] text-muted">
                  <span className="sr-only">{t.inSchedule}: </span>
                  {time}
                </p>
              )}
            </li>
          );
        })}
        <li className="grid content-between gap-4 rounded-2xl border border-dashed border-rule p-4 sm:p-5">
          <span className="text-[17px] font-medium leading-snug text-ink">{t.other}</span>
          <span className="flex flex-wrap items-center gap-x-5">
            <Link href={contactHref} className="link inline-flex min-h-11 w-fit items-center text-[15px]">
              {t.otherCta}
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>
            {packagesHref && (
              <Link href={packagesHref} className="link inline-flex min-h-11 w-fit items-center text-[15px]">
                {d.sponsors.compare}
              </Link>
            )}
          </span>
        </li>
      </ul>
    </div>
  );
}
