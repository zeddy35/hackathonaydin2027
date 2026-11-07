import Link from "next/link";
import type { SiteConfig } from "@/data/types";
import type { PrimaryAction } from "@/lib/cta";
import type { Dict } from "@/lib/dict";
import Countdown from "./Countdown";

export default function Hero({
  d,
  action,
  site,
  partnersHref,
  opensLabel,
}: {
  d: Dict;
  action: PrimaryAction;
  site: SiteConfig;
  partnersHref: string;
  opensLabel: string;
}) {
  const h = d.hero;
  return (
    <section id="top" aria-labelledby="hero-h" className="relative isolate">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="wrap grid gap-8 pb-16 pt-12 md:pb-24 md:pt-20">
        <p className="label">{h.eyebrow}</p>
        <h1
          id="hero-h"
          className="display max-w-[14ch] text-[44px] leading-[1.02] sm:text-[56px] md:text-[80px] md:max-w-none lg:text-[96px] xl:text-[104px]"
        >
          <span className="block">{h.title[0]}</span>
          <span className="block text-accent">{h.title[1]}</span>
        </h1>
        <p className="max-w-[44ch] text-[19px] leading-[1.5] text-ink md:text-[21px]">{h.lead}</p>

        <p className="flex flex-col gap-1 font-mono text-[14px] text-ink sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <span>{h.when}</span>
          <span aria-hidden="true" className="hidden text-muted sm:inline">·</span>
          <span>{h.where}</span>
        </p>

        <div className="grid gap-4">
          <div className="flex flex-wrap gap-3">
            {action.status === "closed" ? (
              <>
                <span className="btn cursor-default border border-rule bg-surface text-muted">{d.cta.closed}</span>
                <Link href={action.href} className="btn btn-secondary">
                  {d.cta.info}
                </Link>
              </>
            ) : (
              <Link href={action.href} className="btn btn-primary">
                {action.label}
              </Link>
            )}
            <Link href={partnersHref} className="btn btn-secondary">
              {d.cta.sponsor}
            </Link>
          </div>
          {action.status === "upcoming" && <p className="text-[15px] text-muted">{d.cta.opensIn(opensLabel)}</p>}
        </div>

        <Countdown start={site.event.kickoff} end={site.event.end} labels={d.countdown} />
      </div>
    </section>
  );
}
