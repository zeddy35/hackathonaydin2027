import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "./env";

/**
 * Refreshes the Supabase session cookie and returns the signed-in user id (or null).
 * Skips the network call entirely for visitors without an auth cookie.
 */
export async function updateSession(req: NextRequest, res: NextResponse) {
  const hasAuthCookie = req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!supabaseConfigured || !hasAuthCookie) return { res, userId: null as string | null };

  let response = res;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        const next = NextResponse.next({ request: req });
        // Keep headers/cookies the caller already put on the response (e.g. redirects are handled separately).
        response.headers.forEach((v, k) => next.headers.set(k, v));
        response = next;
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not put code between createServerClient and getUser (Supabase SSR guidance).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { res: response, userId: user?.id ?? null };
}
