import Link from "next/link";
import type { Block, DocPage as Doc } from "@/content/types";
import type { Dict } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import CopyEmail from "./CopyEmail";
import DocNav from "./DocNav";
import Packages from "./Packages";
import SponsorItems from "./SponsorItems";

function History({ d }: { d: Dict }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {d.past.editions.map((e) => (
        <li key={e.year} className="grid gap-1 rounded-lg border border-rule bg-surface p-5">
          <span className="display text-[32px] leading-none">{e.year}</span>
          <span className="text-[15px] text-muted">{e.label}</span>
          <span className="mt-2 font-mono text-[14px]">
            {e.students} {d.past.students} · {e.teams} {d.past.teams}
          </span>
        </li>
      ))}
    </ul>
  );
}

function renderBlock(b: Block, i: number, ctx: { lang: Locale; d: Dict; email: string }) {
  if ("p" in b) return <p key={i} className="max-w-[64ch]">{b.p}</p>;
  if ("ul" in b)
    return (
      <ul key={i} className="grid max-w-[64ch] gap-2 pl-5 [list-style:square] marker:text-accent">
        {b.ul.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    );
  if ("ol" in b)
    return (
      <ol key={i} className="grid max-w-[64ch] border-t border-rule">
        {b.ol.map((x) => {
          const [when, what] = x.split(" · ");
          return (
            <li key={x} className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-3 border-b border-rule py-2.5 text-[16px]">
              <span className="font-mono text-[14px] text-muted">{when}</span>
              <span>{what}</span>
            </li>
          );
        })}
      </ol>
    );
  if ("note" in b)
    return (
      <p key={i} className="max-w-[64ch] border-l-2 border-accent/40 pl-4 text-[15px] text-muted">
        {b.note}
      </p>
    );
  if ("links" in b)
    return (
      <ul key={i} className="flex flex-wrap gap-x-6">
        {b.links.map((l) => {
          const ext = l.href.startsWith("http");
          return (
            <li key={l.href}>
              {ext ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                  {l.label}
                  <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              ) : (
                <Link href={l.href} className="link inline-flex min-h-11 items-center">
                  {l.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  if ("email" in b)
    return (
      <div key={i}>
        <CopyEmail email={ctx.email} copy={ctx.d.footer.copy} copied={ctx.d.footer.copied} />
      </div>
    );
  if ("packages" in b) return <Packages key={i} lang={ctx.lang} />;
  if ("items" in b) return <SponsorItems key={i} lang={ctx.lang} d={ctx.d} contactHref={`#${ctx.lang === "tr" ? "iletisim" : "contact"}`} />;
  if ("history" in b) return <History key={i} d={ctx.d} />;
  return null;
}

export default function DocPage({ doc, lang, d, email }: { doc: Doc; lang: Locale; d: Dict; email: string }) {
  return (
    <article className="wrap pb-24">
      <header className="grid gap-5 border-b border-rule pb-10 pt-12 md:pb-14 md:pt-20">
        <p className="label text-accent-ink">{doc.eyebrow}</p>
        <h1 className="poster text-[clamp(44px,8vw,104px)]">{doc.title}</h1>
        <p className="max-w-[60ch] text-[19px] leading-[1.55] text-muted">{doc.lead}</p>
        {doc.banner && (
          <p role="note" className="max-w-[64ch] rounded-lg border border-accent/25 bg-accent-tint px-4 py-3 text-[15px] text-ink">
            {doc.banner}
          </p>
        )}
      </header>

      <div className="grid gap-10 pt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <DocNav title={doc.title} sections={doc.sections} />
        <div className="grid min-w-0 gap-12">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="grid gap-4">
              <h2 id={`${s.id}-h`} className="text-[24px] font-semibold leading-tight tracking-[-0.015em]">
                {s.h}
              </h2>
              {s.blocks.map((b, i) => renderBlock(b, i, { lang, d, email }))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
