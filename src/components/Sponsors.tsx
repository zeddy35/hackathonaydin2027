import Image from "next/image";
import Link from "next/link";
import type { Sponsor, SponsorTier } from "@/data/types";
import { packages, type Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import CopyEmail from "./CopyEmail";

const ORDER: SponsorTier[] = ["title", "gold", "silver", "inkind", "tech", "community"];

/** Grid per tier: title is one wide slot; gold 3, silver 4, the rest 4 on desktop; 2 on mobile. */
const GRID: Record<SponsorTier, string> = {
  title: "grid-cols-1",
  gold: "grid-cols-2 md:grid-cols-3",
  silver: "grid-cols-2 md:grid-cols-4",
  inkind: "grid-cols-2 md:grid-cols-4",
  tech: "grid-cols-2 md:grid-cols-4",
  community: "grid-cols-2 md:grid-cols-4",
};

const BOX: Record<SponsorTier, string> = {
  title: "h-28 md:h-36",
  gold: "h-20 md:h-24",
  silver: "h-16 md:h-20",
  inkind: "h-14 md:h-16",
  tech: "h-14 md:h-16",
  community: "h-14 md:h-16",
};

function Logo({ s, tier, newTab }: { s: Sponsor; tier: SponsorTier; newTab: string }) {
  const inline = !s.logo || s.logo.startsWith("data:") || s.logo.endsWith(".svg");
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full min-h-11 items-center justify-center rounded-lg border border-rule bg-surface px-5 py-5 transition-colors hover:border-ink md:px-8"
    >
      <span className="sr-only">{newTab}</span>
      {s.logo ? (
        <span className={`relative block w-full ${BOX[tier]}`}>
          <Image
            src={s.logo}
            alt={s.name}
            fill
            unoptimized={inline}
            sizes={tier === "title" ? "(min-width: 1200px) 800px, 90vw" : "(min-width: 768px) 240px, 45vw"}
            className="object-contain"
          />
        </span>
      ) : (
        <span className={`flex min-h-full w-full items-center justify-center text-center font-semibold leading-tight [overflow-wrap:anywhere] ${BOX[tier]} ${tier === "title" ? "text-[26px]" : "text-[16px]"}`}>
          {s.name}
        </span>
      )}
    </a>
  );
}

/**
 * Sponsorship packages as cards, for the time before any sponsor is published. Name and
 * rights come from `packages` in dict.ts: the last three rights of each package, which are
 * the ones that set it apart. No prices or quotas. The "package" tag keeps a card from
 * reading as a confirmed sponsor.
 */
function PackageCards({ lang, t, href }: { lang: Locale; t: Dict["sponsors"]; href: string }) {
  const { head, rows } = packages[lang];
  return (
    <div className="grid gap-4">
      <h3 className="label">{t.packagesTitle}</h3>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {head.map((name, col) => {
          const rights = rows
            .slice(1)
            .filter((r) => r[col + 1] !== "")
            .map((r) => (r[col + 1] === "●" ? r[0] : `${r[0]}: ${r[col + 1]}`))
            .slice(-3);
          return (
            <li key={name} className="reveal grid content-start gap-4 rounded-2xl border border-dashed border-rule bg-surface p-6">
              <span className="tag w-fit">{t.packageTag}</span>
              <span className="poster text-[34px] md:text-[40px]">{name}</span>
              <ul className="grid gap-1 text-[15px] text-muted">
                {rights.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <Link href={href} className="link inline-flex min-h-11 w-fit items-center text-[14px]">
                {t.details}
                <span className="sr-only">: {name}</span>
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sponsors({
  sponsors,
  lang,
  d,
  partnersHref,
  packagesHref,
  email,
}: {
  sponsors: Sponsor[];
  lang: Locale;
  d: Dict;
  partnersHref: string;
  packagesHref: string;
  email: string;
}) {
  const t = d.sponsors;

  if (sponsors.length === 0) {
    return (
      <div className="grid gap-10">
        <div className="grid gap-6">
          <p className="max-w-[52ch] text-[20px] font-medium leading-snug">{t.empty}</p>
          <p className="max-w-[58ch] text-muted">{t.emptyLead}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={partnersHref} className="btn btn-primary">
              {d.cta.sponsor}
            </Link>
            <CopyEmail email={email} copy={d.footer.copy} copied={d.footer.copied} />
          </div>
        </div>
        <PackageCards lang={lang} t={t} href={packagesHref} />
        <Link href={packagesHref} className="link inline-flex min-h-11 w-fit items-center text-[15px]">
          {t.compare}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12">
      {ORDER.map((tier) => {
        const list = sponsors.filter((s) => s.tier === tier);
        if (list.length === 0) return null;
        return (
          <div key={tier} className="grid gap-4">
            <h3 className="label">{t.tiers[tier]}</h3>
            <ul className={`grid gap-3 ${GRID[tier]}`}>
              {list.map((s) => (
                <li key={s.id} className="min-w-0">
                  <Logo s={s} tier={tier} newTab={t.newTab} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={partnersHref} className="btn btn-secondary">
          {d.cta.sponsor}
        </Link>
        <Link href={packagesHref} className="link text-[15px]">
          {t.compare}
        </Link>
      </div>
    </div>
  );
}
