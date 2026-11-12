import type { ScheduleItem, ScheduleKey } from "@/data/types";
import type { Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import BuildRuler from "./BuildRuler";

/** Milestones shown with emphasis. */
const KEY_POINTS: ScheduleKey[] = ["hackStart", "submit", "finals"];

export default function Schedule({ items, lang, d }: { items: ScheduleItem[]; lang: Locale; d: Dict["schedule"] }) {
  return (
    <div className="grid gap-10">
      <BuildRuler items={items} lang={lang} t={{ build: d.build, hour: d.hour, days: d.days }} />
      <div className="grid gap-10 md:grid-cols-2 md:gap-10">
        {(["sat", "sun"] as const).map((day) => (
          <div key={day} className="min-w-0">
            <h3 className="poster mb-4 text-[28px] text-ink md:text-[36px]">{d.days[day]}</h3>
            <ol className="border-t border-rule">
              {items
                .filter((i) => i.day === day)
                .map((i) => {
                  const strong = KEY_POINTS.includes(i.key);
                  const rest = i.kind === "break";
                  return (
                    <li
                      key={i.key}
                      className={`grid grid-cols-[72px_minmax(0,1fr)] items-baseline gap-3 border-b border-rule py-4 transition-colors hover:bg-surface ${
                        strong ? "font-semibold" : ""
                      }`}
                    >
                      <time className={`font-mono text-[15px] tabular-nums ${strong ? "text-accent-ink" : "text-muted"}`}>{i.time}</time>
                      <span className={`text-[17px] ${rest ? "text-muted" : ""} ${strong ? "text-[19px]" : ""}`}>
                        {i.night && <Moon />}
                        {rest ? <WithTag text={i[lang]} tag={d.break} /> : i[lang]}
                      </span>
                    </li>
                  );
                })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Keeps the tag on the same line as the last word, so it never sits alone on a line. */
function WithTag({ text, tag }: { text: string; tag: string }) {
  const cut = text.lastIndexOf(" ");
  return (
    <>
      {cut > 0 ? `${text.slice(0, cut)} ` : ""}
      <span className="whitespace-nowrap">
        {cut > 0 ? text.slice(cut + 1) : text}
        <span className="ml-2 font-mono text-[11px] tracking-[0.08em] text-muted">{tag}</span>
      </span>
    </>
  );
}

/** Small moon for late-night slots. Decoration only. */
function Moon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="mr-1.5 inline-block h-3.5 w-3.5 -translate-y-px align-[-1px] text-muted" fill="currentColor">
      <path d="M10.6 1.2A6.5 6.5 0 1 0 14.8 11a5.5 5.5 0 0 1-4.2-9.8Z" />
    </svg>
  );
}
