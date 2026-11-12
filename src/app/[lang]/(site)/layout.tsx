import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../../fonts.css";
import "../../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Loader, { LOADER_SCRIPT } from "@/components/Loader";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import { getSiteConfig } from "@/data";
import { primaryAction } from "@/lib/cta";
import { getDict, isLocale, locales } from "@/lib/dict";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return pageMetadata({ lang, page: "home", title: d.meta.title, description: d.meta.description });
}

export const viewport: Viewport = {
  themeColor: "#0C0A09",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);
  const site = await getSiteConfig();
  const action = primaryAction(lang, site, d);
  const mlh = site.mlh.badge && site.mlh.badgeImage && site.mlh.badgeHref ? { href: site.mlh.badgeHref, image: site.mlh.badgeImage } : null;

  return (
    <html lang={lang} className="site night" suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether the opening loader runs (see Loader.tsx). */}
        {/* Saved light/dark choice, applied before first paint (see ThemeToggle.tsx). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOADER_SCRIPT }} />
      </head>
      <body>
        <Loader word={d.loader} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-3 focus:text-bg"
        >
          {d.skip}
        </a>
        <Header
          lang={lang}
          labels={{
            label: d.nav.label,
            event: d.nav.event,
            schedule: d.nav.schedule,
            sponsors: d.nav.sponsors,
            faq: d.nav.faq,
            join: action.join,
            joinShort: d.cta.joinShort[action.status],
            joinShortSr: d.cta.joinShortSr[action.status],
            menu: d.nav.menu,
            close: d.nav.close,
            switchTo: d.nav.switchTo,
            home: d.nav.home,
            themeLight: d.nav.themeLight,
            themeDark: d.nav.themeDark,
          }}
          joinHref={action.href}
          mlh={mlh}
        />
        <main id="main">{children}</main>
        <Footer lang={lang} d={d} email={site.contact.email} instagram={site.social.instagram} />
      </body>
    </html>
  );
}
