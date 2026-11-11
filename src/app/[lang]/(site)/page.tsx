import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import People from "@/components/People";
import Schedule from "@/components/Schedule";
import Section from "@/components/Section";
import Sponsors from "@/components/Sponsors";
import { getPeople, getSchedule, getSiteConfig, getSponsors } from "@/data";
import { primaryAction } from "@/lib/cta";
import { MAPS_URL, getDict, isLocale } from "@/lib/dict";
import { ROLES } from "@/lib/application";
import { pagePath } from "@/lib/routes";
import { panelDict } from "@/content/panel";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);
  const [site, schedule, sponsors, judges, mentors] = await Promise.all([
    getSiteConfig(),
    getSchedule(),
    getSponsors(),
    getPeople("judge"),
    getPeople("mentor"),
  ]);
  const action = primaryAction(lang, site, d);
  const partnersHref = pagePath(lang, "partners");
  const packagesHref = `${partnersHref}#${lang === "tr" ? "paketler" : "packages"}`;
  const closing = d.closing[action.status];
  // Numbered sections ("01 / 07"). Judges and mentors only count when shown.
  const hasPeople = judges.length + mentors.length > 0;
  const order = ["event", "how", "past", "schedule", ...(hasPeople ? ["people"] : []), "sponsors", "venue", "faq"];
  const num = (id: string) => ({ n: order.indexOf(id) + 1, total: order.length });

  return (
    <>
      <Hero
        d={d}
        action={action}
        site={site}
        partnersHref={partnersHref}
        opensLabel={site.application.opensLabel[lang]}
        roles={ROLES.filter((r) => r !== "other").map((key) => ({ key, label: panelDict[lang].form.options.roles[key] }))}
        noTeamHref={`${pagePath(lang, "guide")}#${lang === "tr" ? "basvuru" : "apply"}`}
      />

      {/* 2. Event summary */}
      <Section id="event" {...num("event")} title={d.event.title}>
        <p className="max-w-[60ch] text-[19px] leading-[1.6]">{d.event.text}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-rule pt-8 md:grid-cols-4">
          {d.event.facts.map((f) => (
            <li key={f.label} className="grid content-start gap-1.5">
              <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] md:text-[32px]">{f.value}</span>
              <span className="text-[15px] text-muted">
                {f.label}
                {"note" in f && f.note && <span className="tag ml-2 align-[1px]">{f.note}</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="grid gap-4">
          <h3 className="text-[18px] font-semibold">{d.event.whyTitle}</h3>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
            {d.event.why.map((w) => (
              <li key={w} className="grid grid-cols-[12px_minmax(0,1fr)] items-baseline gap-3 text-[17px]">
                <span aria-hidden="true" className="h-1.5 w-1.5 translate-y-[-2px] bg-accent" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3. How to join */}
      <Section id="how" {...num("how")} title={d.how.title}>
        <ol className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {d.how.steps.map((s, i) => (
            <li key={s.h} className="grid content-start gap-2 border-t border-ink pt-4">
              <span className="font-mono text-[13px] text-accent" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[18px] font-semibold">{s.h}</h3>
              <p className="text-[16px] text-muted">{s.p}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4. Past editions */}
      <Section id="past" {...num("past")} title={d.past.title}>
        {d.past.editions.map((e) => (
          <article key={e.year} aria-labelledby={`y${e.year}`} className="grid gap-6 border-b border-rule pb-12 last:border-b-0 last:pb-0">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <h3 id={`y${e.year}`} className="display text-[40px] leading-none">
                {e.year}
              </h3>
              <span className="text-[16px] text-muted">{e.label}</span>
              <span className="font-mono text-[14px] text-ink">
                {e.students} {d.past.students} · {e.teams} {d.past.teams}
              </span>
            </div>
            {/* Bento: first photo large (2x2), the other four fill the rest. Every tile crops with
                object-cover, so mixed portrait/landscape originals still form a tidy grid. */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:grid-rows-[repeat(2,minmax(0,1fr))]">
              {e.photos.map((p, i) => (
                <figure
                  key={p.src}
                  className={`group/ph relative m-0 overflow-hidden rounded-md bg-rule ${
                    i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-square md:aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1200px) 520px, (min-width: 768px) 45vw, 100vw" : "(min-width: 1200px) 260px, (min-width: 768px) 22vw, 50vw"}
                    style={{ objectPosition: p.pos }}
                    className="object-cover transition-transform duration-500 ease-out group-hover/ph:scale-[1.03]"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 pb-2 pt-8 font-mono text-[12px] leading-tight text-white">
                    {p.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </Section>

      {/* 5. Schedule */}
      <Section id="schedule" {...num("schedule")} title={d.schedule.title} aside={<span className="tag w-fit">{d.schedule.draft}</span>}>
        <Schedule items={schedule} lang={lang} d={d.schedule} />
        <p className="max-w-[60ch] text-[15px] text-muted">{d.schedule.note}</p>
      </Section>

      {/* Judges and mentors: only when someone is published. */}
      {hasPeople && (
        <Section id="people" {...num("people")} title={d.people.title}>
          <People people={judges} title={d.people.judges} />
          <People people={mentors} title={d.people.mentors} />
        </Section>
      )}

      {/* 6. Sponsors */}
      <Section id="sponsors" {...num("sponsors")} title={d.sponsors.title}>
        <Sponsors sponsors={sponsors} d={d} partnersHref={partnersHref} packagesHref={packagesHref} email={site.contact.email} />
      </Section>

      {/* 7. Venue */}
      <Section id="venue" {...num("venue")} title={d.venue.title}>
        <div className="grid gap-2">
          <p className="text-[20px] font-medium leading-snug">{d.venue.place}</p>
          <p className="text-muted">{d.venue.placeNote}</p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 w-fit items-center text-[15px]">
            {d.venue.map}
            <span aria-hidden="true" className="ml-1">↗</span>
          </a>
        </div>
        <dl className="grid gap-6 border-t border-rule pt-8 md:grid-cols-3">
          {d.venue.items.map((it) => (
            <div key={it.h} className="grid content-start gap-1">
              <dt className="font-semibold">{it.h}</dt>
              <dd className="text-[16px] text-muted">{it.p}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 8. FAQ */}
      <Section id="faq" {...num("faq")} title={d.faq.title}>
        <Faq items={d.faq.items} />
      </Section>

      {/* 9. Closing */}
      <section id="join" aria-labelledby="closing-h" className="wrap">
        <div className="grid gap-6 border-t border-rule py-20 md:py-28">
          <h2 id="closing-h" className="display max-w-[20ch] text-[36px] leading-[1.08] md:text-[52px]">
            {closing.h}
          </h2>
          <p className="max-w-[52ch] text-[18px] text-muted">{closing.p}</p>
          <div className="flex flex-wrap gap-3">
            {action.status === "open" ? (
              <Link href={action.href} className="btn btn-primary">
                {d.cta.apply}
              </Link>
            ) : (
              <Link href={pagePath(lang, "guide")} className="btn btn-primary">
                {d.cta.info}
              </Link>
            )}
            <Link href={partnersHref} className="btn btn-secondary">
              {d.cta.sponsor}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
