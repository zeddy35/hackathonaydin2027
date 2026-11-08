import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ownerEmails, safeNext } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Finishes every sign-in:
 * - Google and PKCE magic links arrive with ?code=
 * - email templates that use {{ .TokenHash }} arrive with ?token_hash=&type=
 * Then promotes OWNER_EMAILS to owner on first sign-in and redirects to ?next=.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"), "/tr/panel");
  const lang = next.startsWith("/en") ? "en" : "tr";
  const fail = (code: string) => {
    const to = new URL(lang === "en" ? "/en/login" : "/tr/giris", url.origin);
    to.searchParams.set("error", code);
    to.searchParams.set("next", next);
    return NextResponse.redirect(to);
  };

  const providerError = url.searchParams.get("error_code") ?? url.searchParams.get("error");
  if (providerError) return fail(providerError === "otp_expired" ? "expired" : "link");

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail(error.code === "otp_expired" ? "expired" : "link");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail(error.code === "otp_expired" ? "expired" : "link");
  } else {
    return fail("link");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("link");

  const email = user.email?.toLowerCase();
  if (email && ownerEmails.includes(email)) {
    const admin = createAdminClient();
    if (admin) {
      await admin.from("profiles").update({ role: "owner" }).eq("id", user.id).neq("role", "owner");
    } else {
      console.warn("OWNER_EMAILS match but SUPABASE_SERVICE_ROLE_KEY is not set; role not updated.");
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
