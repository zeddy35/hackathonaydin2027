import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "@/components/Faq";
import FoodReviews from "@/components/FoodReviews";
import Hero from "@/components/Hero";
import People from "@/components/People";
import Schedule from "@/components/Schedule";
import Section from "@/components/Section";
import Sponsors from "@/components/Sponsors";
import TeamBuilder from "@/components/TeamBuilder";
import { getPeople, getSchedule, getSiteConfig, getSponsors } from "@/data";
import { foodReviews } from "@/data/food-reviews";
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
      <Hero d={d} action={action} site={site} partnersHref={partnersHref} />

      {/* 2. Event summary */}
      <Section id="event" {...num("event")} title={d.event.title}>
        <p className="reveal max-w-[28ch] text-[clamp(24px,3.4vw,44px)] font-semibold leading-[1.15] tracking-[-0.02em]">{d.event.text}</p>
        <ul className="reveal grid grid-cols-2 overflow-hidden rounded-2xl border border-rule lg:grid-cols-4">
          {d.event.facts.map((f, i) => (
            <li
              key={f.label}
              className={`group/f grid content-between gap-8 border-rule bg-surface p-5 transition-colors hover:bg-accent hover:text-on-accent sm:p-7 ${
                i % 2 ? "border-l" : "lg:border-l"
              } ${i > 1 ? "max-lg:border-t" : ""} ${i === 0 ? "lg:border-l-0" : ""}`}
            >
              <span className="font-mono text-[12px] tracking-[0.14em] text-muted transition-colors group-hover/f:text-on-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid gap-2">
                <span className="poster text-[clamp(30px,4.4vw,58px)]">{f.value}</span>
                <span className="text-[15px] text-muted transition-colors group-hover/f:text-on-accent">
                  {f.label}
                  {"note" in f && f.note && <span className="tag ml-2 align-[1px] group-hover/f:border-on-accent group-hover/f:text-on-accent">{f.note}</span>}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="reveal grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <h3 className="poster text-[28px] text-amber md:text-[36px]">{d.event.whyTitle}</h3>
          <ul className="grid border-t border-rule">
            {d.event.why.map((w, i) => (
              <li key={w} className="grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-3 border-b border-rule py-4 text-[18px] md:text-[20px]">
                <span aria-hidden="true" className="font-mono text-[13px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 3. How to join */}
      <Section id="how" {...num("how")} title={d.how.title}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {d.how.steps.map((s, i) => (
              <li key={s.h} className="reveal relative grid content-start gap-3 overflow-hidden rounded-2xl border border-rule bg-surface p-6 transition-colors hover:border-accent">
                <span aria-hidden="true" className="poster outline-text pointer-events-none absolute -right-1 -top-3 text-[110px] opacity-30 lg:-bottom-8 lg:right-3 lg:top-auto lg:text-[230px]">
                  {i + 1}
                </span>
                <span className="font-mono text-[13px] text-accent" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="poster text-[26px] md:text-[30px]">{s.h}</h3>
                <p className="text-[16px] text-muted">{s.p}</p>
              </li>
            ))}
          </ol>
          <div className="reveal min-w-0 lg:col-span-5">
            <TeamBuilder
              t={d.team}
              roles={ROLES.filter((r) => r !== "other").map((key) => ({ key, label: panelDict[lang].form.options.roles[key] }))}
              actionHref={action.href}
              actionLabel={action.join}
              noTeamHref={`${pagePath(lang, "guide")}#${lang === "tr" ? "basvuru" : "apply"}`}
            />
          </div>
        </div>
      </Section>

      {/* 4. Past editions */}
      <Section id="past" {...num("past")} title={d.past.title}>
        {d.past.editions.map((e) => (
          <article key={e.year} aria-labelledby={`y${e.year}`} className="grid gap-6">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
              <h3 id={`y${e.year}`} className="poster outline-text text-[clamp(72px,13vw,180px)] leading-[0.8]">
                {e.year}
              </h3>
              <div className="grid gap-1 pb-1">
                <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">{e.label}</span>
                <span className="poster text-[24px] md:text-[32px]">
                  {e.students} {d.past.students} <span className="text-amber">/</span> {e.teams} {d.past.teams}
                </span>
              </div>
            </div>
            {/* Bento: first photo large (2x2), the other four fill the rest. Every tile crops with
                object-cover, so mixed portrait/landscape originals still form a tidy grid. */}
            <div className="reveal grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:grid-rows-[repeat(2,minmax(0,1fr))]">
              {e.photos.map((p, i) => (
                <figure
                  key={p.src}
                  className={`group/ph relative m-0 overflow-hidden rounded-xl bg-surface ring-1 ring-rule transition-shadow hover:ring-2 hover:ring-accent ${
                    i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-square md:aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1200px) 580px, (min-width: 768px) 48vw, 100vw" : "(min-width: 1200px) 290px, (min-width: 768px) 24vw, 50vw"}
                    style={{ objectPosition: p.pos }}
                    className="object-cover transition-transform duration-700 ease-out group-hover/ph:scale-[1.05]"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-10 font-mono text-[12px] leading-tight text-white">
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
        <p className="max-w-[60ch] font-mono text-[13px] text-muted">{d.schedule.note}</p>
        <FoodReviews reviews={foodReviews} lang={lang} t={d.schedule.food} />
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
        <div className="reveal grid gap-3">
          <p className="max-w-[24ch] text-[clamp(24px,3.4vw,44px)] font-semibold leading-[1.15] tracking-[-0.02em]">{d.venue.place}</p>
          <p className="text-muted">{d.venue.placeNote}</p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-2 w-fit">
            {d.venue.map}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl className="grid gap-4 md:grid-cols-3">
          {d.venue.items.map((it) => (
            <div key={it.h} className="reveal grid content-start gap-2 rounded-2xl border border-rule bg-surface p-6">
              <dt className="poster text-[24px] text-amber">{it.h}</dt>
              <dd className="text-[16px] text-muted">{it.p}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 8. FAQ */}
      <Section id="faq" {...num("faq")} title={d.faq.title}>
        <Faq items={d.faq.items} />
      </Section>

      {/* 9. Closing: full-width orange block */}
      <section id="join" aria-labelledby="closing-h" className="relative isolate mt-8 overflow-hidden bg-accent text-on-accent">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgb(19_8_5/0.22)_1.3px,transparent_1.7px)] bg-[length:14px_14px] [mask-image:linear-gradient(240deg,#000,transparent_55%)]" />
        <div className="wrap grid gap-8 py-20 md:py-28">
          <h2 id="closing-h" className="poster reveal-x max-w-[12ch] text-[clamp(52px,11vw,168px)]">
            {closing.h}
          </h2>
          <p className="max-w-[44ch] text-[19px] font-medium md:text-[22px]">{closing.p}</p>
          <div className="flex flex-wrap gap-3">
            {action.status === "open" ? (
              <Link href={action.href} className="btn btn-ink">
                {d.cta.apply} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link href={pagePath(lang, "guide")} className="btn btn-ink">
                {d.cta.info} <span aria-hidden="true">→</span>
              </Link>
            )}
            <Link href={partnersHref} className="btn btn-on-accent">
              {d.cta.sponsor}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
