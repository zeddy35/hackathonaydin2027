import type { ScheduleItem, ScheduleKey } from "@/data/types";
import type { Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";

/** Milestones shown with emphasis. */
const KEY_POINTS: ScheduleKey[] = ["hackStart", "submit", "finals"];

export default function Schedule({ items, lang, d }: { items: ScheduleItem[]; lang: Locale; d: Dict["schedule"] }) {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-8">
      {(["sat", "sun"] as const).map((day) => (
        <div key={day} className="min-w-0">
          <h3 className="mb-3 text-[18px] font-semibold">{d.days[day]}</h3>
          <ol className="border-t border-rule">
            {items
              .filter((i) => i.day === day)
              .map((i) => {
                const strong = KEY_POINTS.includes(i.key);
                return (
                  <li
                    key={i.key}
                    className={`grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3 border-b border-rule py-3.5 ${
                      strong ? "font-semibold" : ""
                    }`}
                  >
                    <time className={`font-mono text-[14px] tabular-nums ${strong ? "text-accent" : "text-muted"}`}>{i.time}</time>
                    <span className="text-[16px]">
                      {i[lang]}
                    </span>
                  </li>
                );
              })}
          </ol>
        </div>
      ))}
    </div>
  );
}
