import Link from "next/link";
import type { SiteConfig } from "@/data/types";
import type { PrimaryAction } from "@/lib/cta";
import type { Dict } from "@/lib/dict";
import Countdown from "./Countdown";
import Marquee from "./Marquee";
import RedPen from "./RedPen";

export default function Hero({
  d,
  action,
  site,
  partnersHref,
}: {
  d: Dict;
  action: PrimaryAction;
  site: SiteConfig;
  partnersHref: string;
}) {
  const h = d.hero;

  return (
    <section id="top" aria-labelledby="hero-h" className="relative isolate flex min-h-[calc(100dvh-var(--header-h))] flex-col [overflow-x:clip]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-glow" />
        <div className="halftone absolute inset-0" />
      </div>

      <div className="wrap flex flex-1 flex-col justify-center gap-6 pb-10 pt-4 sm:gap-7 lg:pb-10">
        {/* The name, as large as the screen allows. Both lines have nine characters, so they set to the same width. */}
        <h1 id="hero-h" className="poster -ml-[0.03em] text-[19vw] leading-[0.9] md:text-[clamp(96px,min(15.2vw,21.5dvh),250px)]">
          <span className="ha-line">
            <span style={{ ["--i" as string]: 0 }}>Hackathon</span>
          </span>
          <span className="ha-line whitespace-nowrap">
            <span style={{ ["--i" as string]: 1 }}>
              <span className="text-accent">Aydın</span> <span className="outline-text">2027</span>
            </span>
          </span>
        </h1>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="grid min-w-0 gap-6 lg:col-span-7">
            {/* Three lines. The middle one is struck out with a red pen and hidden from screen readers. */}
            <p className="grid gap-1 text-[clamp(24px,3vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em]">
              <span className="block">{h.title[0]}</span>
              <span aria-hidden="true" className="block w-fit max-w-full text-muted">
                <RedPen>{h.title[1]}</RedPen>
              </span>
              <span className="block">{h.title[2]}</span>
            </p>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-3">
                {action.status === "closed" ? (
                  <>
                    <span className="btn cursor-default border border-rule bg-surface text-muted">{d.cta.closed}</span>
                    <Link href={action.href} className="btn btn-secondary">
                      {d.cta.info}
                    </Link>
                  </>
                ) : (
                  <Link href={action.href} className="btn btn-primary group/cta">
                    {action.label}
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/cta:translate-x-1">
                      →
                    </span>
                  </Link>
                )}
                <Link href={partnersHref} className="btn btn-secondary">
                  {d.cta.sponsor}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 lg:col-span-5">
            <p className="text-[20px] font-light leading-none tracking-[0.02em] text-ink sm:text-[24px]">{h.when}</p>
            <Countdown t={h.countdown} start={site.event.kickoff} end={site.event.end} />
          </div>
        </div>
      </div>

      {/* Ticker band, tilted, wider than the screen so the ends never show. */}
      <div className="relative -mx-[3vw] mb-6 -rotate-[1.4deg] bg-accent py-2.5 text-on-accent shadow-[0_18px_40px_-18px_var(--accent-deep)] sm:py-3">
        <Marquee items={h.ticker} className="poster text-[22px] leading-none sm:text-[30px]" />
      </div>
    </section>
  );
}
