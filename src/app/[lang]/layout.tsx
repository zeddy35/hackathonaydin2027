import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
  themeColor: "#FAFAF8",
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
    <html lang={lang}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
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
            join: d.nav.join,
            menu: d.nav.menu,
            close: d.nav.close,
            switchTo: d.nav.switchTo,
            home: d.nav.home,
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
