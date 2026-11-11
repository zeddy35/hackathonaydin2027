import Link from "next/link";
import type { SiteConfig } from "@/data/types";
import type { PrimaryAction } from "@/lib/cta";
import type { Dict } from "@/lib/dict";
import HackerPass from "./HackerPass";

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
  // Same target and label as the header button: form when open, participant guide otherwise.
  const passLink = { href: action.href, label: action.join };

  return (
    <section id="top" aria-labelledby="hero-h" className="relative isolate [overflow-x:clip]">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="wrap grid items-center gap-6 pb-16 pt-12 md:gap-12 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8">
        <div className="grid min-w-0 gap-8 lg:col-span-7">
          <p className="label">{h.eyebrow}</p>
          <h1 id="hero-h" className="display text-[clamp(44px,14vw,64px)] leading-[1.02] md:text-[72px] lg:text-[76px] xl:text-[88px]">
            <span className="ha-line">
              <span style={{ ["--i" as string]: 0 }}>{h.title[0]}</span>
            </span>
            <span className="ha-line text-accent">
              <span style={{ ["--i" as string]: 1 }}>{h.title[1]}</span>
            </span>
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
          <HackerPass t={d.pass} start={site.event.kickoff} end={site.event.end} linkHref={passLink.href} linkLabel={passLink.label} />
        </div>
      </div>
    </section>
  );
}
