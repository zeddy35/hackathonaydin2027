import Link from "next/link";
import type { SiteConfig } from "@/data/types";
import type { PrimaryAction } from "@/lib/cta";
import type { Dict } from "@/lib/dict";
import KickoffChip from "./KickoffChip";
import RedPen from "./RedPen";
import TeamBuilder from "./TeamBuilder";

export default function Hero({
  d,
  action,
  site,
  partnersHref,
  opensLabel,
  roles,
  noTeamHref,
}: {
  d: Dict;
  action: PrimaryAction;
  site: SiteConfig;
  partnersHref: string;
  opensLabel: string;
  roles: { key: string; label: string }[];
  noTeamHref: string;
}) {
  const h = d.hero;

  return (
    <section id="top" aria-labelledby="hero-h" className="relative isolate [overflow-x:clip]">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="wrap grid items-center gap-6 pb-16 pt-12 md:gap-12 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8">
        <div className="grid min-w-0 gap-8 lg:col-span-7">
          <p className="label">{h.eyebrow}</p>
          {/* Accessible name is lines 1 and 3 only; the struck line is visual. */}
          <h1 id="hero-h" className="display text-[clamp(44px,14vw,64px)] leading-[1.02] md:text-[72px] lg:text-[68px] xl:text-[80px]">
            <span className="ha-line">
              <span style={{ ["--i" as string]: 0 }}>{h.title[0]}</span>
            </span>
            <span aria-hidden="true" className="ha-line ha-l2 text-[0.62em] leading-[1.15] text-muted">
              <span style={{ ["--i" as string]: 1 }}>
                <RedPen text={h.title[1]} />
              </span>
            </span>
            <span className="ha-line ha-l3 text-accent">
              <span>{h.title[2]}</span>
            </span>
          </h1>
          <p className="max-w-[44ch] text-[19px] leading-[1.5] text-ink md:text-[21px]">{h.lead}</p>

          <div className="flex flex-col gap-2 font-mono text-[14px] text-ink sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
            <span>{h.when}</span>
            <span aria-hidden="true" className="hidden text-muted sm:inline">·</span>
            <span>{h.where}</span>
            <KickoffChip t={h.countdown} start={site.event.kickoff} end={site.event.end} />
          </div>

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
                <Link href={action.href} className="btn btn-primary active:scale-[0.97]">
                  {action.label}
                </Link>
              )}
              <Link href={partnersHref} className="btn btn-secondary">
                {d.cta.sponsor}
              </Link>
            </div>
            {action.status === "upcoming" && <p className="text-[15px] text-muted">{d.cta.opensIn(opensLabel)}</p>}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <TeamBuilder t={d.team} roles={roles} actionHref={action.href} actionLabel={action.join} noTeamHref={noTeamHref} />
        </div>
      </div>
    </section>
  );
}
