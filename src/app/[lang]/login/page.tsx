import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LoginPage from "@/components/LoginPage";
import { authDict } from "@/content/auth";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

/** Reads the session cookie on every request. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ next?: string; error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = authDict[lang].login;
  return { ...pageMetadata({ lang, page: "login", title: `${t.title} · Hackathon Aydın 2027`, description: t.description }), robots: { index: false } };
}

/** English slug. /tr/login redirects to /tr/giris. */
export default async function Page({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = await searchParams;
  if (lang === "tr") redirect(`/tr/giris${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`);
  return <LoginPage lang={lang} searchParams={sp} />;
}
