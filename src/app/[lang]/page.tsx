import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Schedule from "@/components/Schedule";
import Faq from "@/components/Faq";
import CopyEmail from "@/components/CopyEmail";
import { CONTACT, getDict, isLocale } from "@/lib/dict";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <Header nav={d.nav} lang={lang} />
      <main>
        <Hero d={d.hero} />

        <Section id="about" title={d.about.title}>
          <Reveal>
            <p className="max-w-[58ch] text-[19px] leading-[1.65]">{d.about.text}</p>
          </Reveal>
          <Reveal delay={0.08} className="grid grid-cols-3 gap-4 sm:gap-6">
            {d.about.facts.map(([n, l]) => (
              <div key={l} className="grid gap-1 border-t border-rule pt-4">
                <span className="display text-[clamp(21px,4vw,44px)] leading-none">{n}</span>
                <span className="text-[14px] text-muted">{l}</span>
              </div>
            ))}
          </Reveal>
        </Section>

        <Section id="schedule" title={d.schedule.title}>
          <Schedule d={d.schedule} />
        </Section>

        <Section id="sponsors" title={d.sponsors.title}>
          <Reveal>
            <p className="max-w-[58ch] text-[19px] leading-[1.65]">{d.sponsors.text}</p>
          </Reveal>
          <Reveal className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[15px]">
              <thead>
                <tr>
                  {d.sponsors.head.map((h, i) => (
                    <th key={i} className="border-b border-ink pb-3 pr-4 text-left text-[14px] font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.sponsors.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((c, i) => (
                      <td
                        key={i}
                        className={`border-b border-rule py-3 pr-4 ${i === 0 ? "text-ink" : "text-muted"} ${c === "●" ? "!text-red" : ""}`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <Reveal className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-[15px] font-semibold">{d.sponsors.contact}</span>
            <CopyEmail email={CONTACT} copy={d.sponsors.copy} copied={d.sponsors.copied} />
          </Reveal>
        </Section>

        <Section id="last" title={d.last.title}>
          {d.last.editions.map((e) => (
            <Reveal key={e.year} className="grid gap-5 border-t border-rule pt-5 first:border-t-0 first:pt-0">
              <div className="flex items-baseline gap-3">
                <span className="display text-[clamp(28px,3.4vw,40px)] leading-none">{e.year}</span>
                <span className="text-[15px] text-muted">{e.label}</span>
              </div>
              {e.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:max-w-[320px] sm:gap-6">
                  {e.stats.map(([n, l]) => (
                    <div key={l} className="grid gap-0.5">
                      <span className="text-[24px] font-semibold leading-none tabular-nums">{n}</span>
                      <span className="text-[14px] text-muted">{l}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {e.photos.map(([src, alt, cap]) => (
                  <figure key={src} className="m-0 grid gap-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                      <Image src={src} alt={alt} fill unoptimized sizes="(min-width: 768px) 40vw, 50vw" className="object-cover object-[center_65%]" />
                    </div>
                    {cap && <figcaption className="text-[14px] text-muted">{cap}</figcaption>}
                  </figure>
                ))}
              </div>
            </Reveal>
          ))}
        </Section>

        <Section id="faq" title={d.faq.title}>
          <Reveal>
            <Faq items={d.faq.items} />
          </Reveal>
        </Section>
      </main>

      <footer className="gutter mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink py-10 pb-[max(40px,env(safe-area-inset-bottom))] text-[14px] text-muted">
          <span>Hackathon Aydın 2027 · {d.footer.org}</span>
          <a className="hover:text-ink" href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer">
            {d.footer.coc}
          </a>
        </div>
      </footer>
    </>
  );
}
