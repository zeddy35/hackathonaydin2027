import type { FoodReview } from "@/data/food-reviews";
import type { Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";

/** "Nobody went hungry": real participant quotes. Renders nothing until one is published. */
export default function FoodReviews({ reviews, lang, t }: { reviews: FoodReview[]; lang: Locale; t: Dict["schedule"]["food"] }) {
  const shown = reviews.filter((r) => r.published);
  if (!shown.length) return null;

  return (
    <div className="grid gap-5 border-t border-rule pt-10">
      <div className="grid gap-1.5">
        <h3 className="display text-[26px] leading-tight md:text-[30px]">{t.title}</h3>
        <p className="max-w-[60ch] text-[16px] text-muted">{t.lead}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => {
          const translated = lang === "en" && r.quote.en;
          const fromTr = lang === "en" && !r.quote.en;
          return (
            <li key={`${r.author}-${r.quote.tr.slice(0, 24)}`} className="grid content-between gap-4 rounded-xl border border-rule bg-surface p-5">
              <figure className="m-0 grid gap-4">
                {r.rating && <Stars n={r.rating} label={t.rating.replace("{n}", String(r.rating))} />}
                <blockquote lang={translated ? "en" : "tr"} className="m-0 text-[19px] font-medium leading-[1.45]">
                  “{translated ? r.quote.en : r.quote.tr}”
                </blockquote>
                <figcaption className="flex flex-wrap items-baseline gap-x-2 font-mono text-[13px] text-muted">
                  <span>{r.author}</span>
                  {!r.author.includes(String(r.year)) && <span>· {r.year}</span>}
                  {fromTr && <span className="tag">{t.fromTr}</span>}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stars({ n, label }: { n: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
          <path d="M8 1.5l1.9 4 4.4.5-3.3 3 .9 4.4L8 11.2l-3.9 2.2.9-4.4-3.3-3 4.4-.5L8 1.5Z" />
        </svg>
      ))}
    </span>
  );
}
