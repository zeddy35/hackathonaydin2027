import Link from "next/link";
import { COC_URL, type Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import CopyEmail from "./CopyEmail";
import Logo from "./Logo";

export default function Footer({
  lang,
  d,
  email,
  instagram,
}: {
  lang: Locale;
  d: Dict;
  email: string;
  instagram: string;
}) {
  const f = d.footer;
  const links = [
    { href: pagePath(lang, "guide"), label: f.guide },
    { href: pagePath(lang, "rules"), label: f.rules },
    { href: pagePath(lang, "partners"), label: f.partners },
    { href: pagePath(lang, "privacy"), label: f.privacy },
  ];
  const external = [
    { href: COC_URL, label: f.coc },
    { href: instagram, label: f.instagram },
  ];

  return (
    <footer className="border-t border-rule bg-surface">
      <div className="wrap grid gap-10 py-14 pb-[max(56px,env(safe-area-inset-bottom))] md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="text-[15px] text-muted">
            {f.org} {f.orgName}
            <br />
            {f.uni}
          </p>
        </div>
        <div className="grid content-start gap-2">
          <h2 className="label">{f.contact}</h2>
          <CopyEmail email={email} copy={f.copy} copied={f.copied} />
        </div>
        <div className="grid content-start gap-2">
          <h2 className="label">{f.links}</h2>
          <ul className="grid text-[15px]">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link inline-flex min-h-11 items-center">
                  {l.label}
                </Link>
              </li>
            ))}
            {external.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                  {l.label}
                  <span aria-hidden="true" className="ml-1 text-muted">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
