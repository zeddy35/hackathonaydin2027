import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import DocPage from "@/components/DocPage";
import { guide } from "@/content/guide";
import { partners } from "@/content/partners";
import { rules } from "@/content/rules";
import type { DocPage as Doc } from "@/content/types";
import { getSiteConfig } from "@/data";
import { getDict, isLocale, locales, type Locale } from "@/lib/dict";
import { livePages, pagePath, pageSlugs, resolveSlug, type PageKey } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

const docs: Partial<Record<PageKey, Record<Locale, Doc>>> = { guide, rules, partners };

/** Every live page in its own language, plus the other language's slug so it can redirect. */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    livePages.flatMap((key) => [...new Set<string>([pageSlugs[key].tr, pageSlugs[key].en])].map((slug) => ({ lang, slug })))
  );
}

export const dynamicParams = false;

function lookup(lang: string, slug: string) {
  if (!isLocale(lang)) return null;
  const r = resolveSlug(slug);
  if (!r || !livePages.includes(r.key)) return null;
  return { lang, key: r.key, canonical: pageSlugs[r.key][lang] === slug };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const hit = lookup(lang, slug);
  const doc = hit && docs[hit.key]?.[hit.lang];
  if (!hit || !doc) return {};
  return pageMetadata({ lang: hit.lang, page: hit.key, title: `${doc.title} · Hackathon Aydın 2027`, description: doc.description });
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const hit = lookup(lang, slug);
  const doc = hit && docs[hit.key]?.[hit.lang];
  if (!hit || !doc) notFound();
  // /tr/guide → /tr/rehber, /en/kurallar → /en/rules
  if (!hit.canonical) permanentRedirect(pagePath(hit.lang, hit.key));
  const site = await getSiteConfig();
  return <DocPage doc={doc} lang={hit.lang} d={getDict(hit.lang)} email={site.contact.email} />;
}
