import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { alternatesFor, type PageKey } from "./routes";

/** No domain yet. Set NEXT_PUBLIC_SITE_URL on Vercel once one is bought. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hackathonaydin.vercel.app").replace(/\/$/, "");

export function pageMetadata({
  lang,
  page,
  title,
  description,
}: {
  lang: Locale;
  page: PageKey | "home";
  title: string;
  description: string;
}): Metadata {
  const alt = alternatesFor(page);
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: alt[lang],
      languages: { tr: alt.tr, en: alt.en, "x-default": alt.en },
    },
    openGraph: {
      title,
      description,
      url: alt[lang],
      siteName: "Hackathon Aydın",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      images: [{ url: "/img/team.jpg", width: 1280, height: 959 }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
