import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../fonts.css";
import "../../globals.css";
import Logo from "@/components/Logo";
import { getDict, isLocale, locales } from "@/lib/dict";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  viewportFit: "cover",
};

/**
 * Separate root layout for the participant area (login and panel): no site header,
 * footer or opening loader. Only the wordmark, which leads back to the site.
 */
export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <html lang={lang}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          {d.skip}
        </a>
        <div className="flex min-h-dvh flex-col">
          <div className="wrap max-w-[880px] pt-4">
            <Link href={`/${lang}`} aria-label={d.nav.home} className="group/logo inline-flex min-h-11 items-center">
              <Logo />
            </Link>
          </div>
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
