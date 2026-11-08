import type { Locale } from "./i18n";

/** Pages that live under /[lang]/[slug]. Each has one slug per language. */
export const pageSlugs = {
  guide: { tr: "rehber", en: "guide" },
  rules: { tr: "kurallar", en: "rules" },
  partners: { tr: "partner", en: "partners" },
  /** Application form, added in task 3. Not rendered yet. */
  apply: { tr: "basvuru", en: "apply" },
  login: { tr: "giris", en: "login" },
  panel: { tr: "panel", en: "panel" },
} as const;

export type PageKey = keyof typeof pageSlugs;

/** Pages that exist today (used for static params and the sitemap). */
export const livePages: PageKey[] = ["guide", "rules", "partners"];

export const pagePath = (lang: Locale, key: PageKey) => `/${lang}/${pageSlugs[key][lang]}`;

/** Finds the page for a slug in any language, so /tr/guide can redirect to /tr/rehber. */
export function resolveSlug(slug: string): { key: PageKey; lang: Locale } | null {
  for (const key of Object.keys(pageSlugs) as PageKey[]) {
    for (const lang of ["tr", "en"] as const) {
      if (pageSlugs[key][lang] === slug) return { key, lang };
    }
  }
  return null;
}

/** Same page in every language, used by the language switch and hreflang. */
export function alternatesFor(key: PageKey | "home"): Record<Locale, string> {
  if (key === "home") return { tr: "/tr", en: "/en" };
  return { tr: pagePath("tr", key), en: pagePath("en", key) };
}
