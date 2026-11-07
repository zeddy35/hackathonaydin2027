import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { alternatesFor, livePages } from "@/lib/routes";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["home" as const, ...livePages];
  return pages.flatMap((key) => {
    const alt = alternatesFor(key);
    return locales.map((lang) => ({
      url: `${siteUrl}${alt[lang]}`,
      alternates: { languages: { tr: `${siteUrl}${alt.tr}`, en: `${siteUrl}${alt.en}` } },
    }));
  });
}
