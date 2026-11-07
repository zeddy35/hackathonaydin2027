import type { Dict } from "@/lib/dict";
import Reveal from "./Reveal";

export default function Schedule({ d }: { d: Dict["schedule"] }) {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {d.days.map((day, k) => (
        <Reveal key={day.d} delay={k * 0.08} className="min-w-0">
          <h3 className="mb-3 text-[17px] font-semibold">{day.d}</h3>
          <ol>
            {day.items.map(([time, what]) => (
              <li key={time} className="grid grid-cols-[64px_minmax(0,1fr)] border-t border-rule py-3 text-[16px]">
                <time className="font-mono text-[14px] tabular-nums text-muted">{time}</time>
                <span>{what}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      ))}
    </div>
  );
}
