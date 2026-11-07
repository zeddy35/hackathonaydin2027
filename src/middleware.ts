import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "tr"];

/**
 * Picks the language for a visitor with no locale in the URL:
 * 1. a language they chose before (cookie),
 * 2. their country (Vercel sets x-vercel-ip-country; Cloudflare sets cf-ipcountry),
 * 3. their browser language,
 * 4. English.
 */
function pickLocale(req: NextRequest): string {
  const saved = req.cookies.get("lang")?.value;
  if (saved && LOCALES.includes(saved)) return saved;

  const country =
    req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "";
  if (country.toUpperCase() === "TR") return "tr";
  if (country) return "en";

  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return accept.startsWith("tr") ? "tr" : "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|img|.*\\..*).*)"],
};
