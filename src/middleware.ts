import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOCALES = ["en", "tr"];
/** Routes outside the /tr and /en trees. */
const UNLOCALIZED = ["/auth", "/admin"];

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

const loginPath = (lang: string) => (lang === "en" ? "/en/login" : "/tr/giris");

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Supabase falls back to the Site URL when a redirect URL is not on its allow list,
  // so a sign-in can land on "/" or "/tr" with ?code=. Finish it in the callback.
  if (req.nextUrl.searchParams.has("code") && !pathname.startsWith("/auth/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) url.searchParams.set("next", `/${LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? pickLocale(req)}/panel`);
    return NextResponse.redirect(url);
  }
  const unlocalized = UNLOCALIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const locale = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (!unlocalized && !locale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const { res, userId } = await updateSession(req, NextResponse.next({ request: req }));

  // Protected areas: send signed-out visitors to the login page, then back.
  const isPanel = locale && (pathname === `/${locale}/panel` || pathname.startsWith(`/${locale}/panel/`));
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if ((isPanel || isAdmin) && !userId) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath(locale ?? pickLocale(req));
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|img|.*\\..*).*)"],
};
