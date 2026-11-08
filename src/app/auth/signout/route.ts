import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** POST only, so a link or prefetch can never sign someone out. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const lang = form?.get("lang") === "en" ? "en" : "tr";
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL(`/${lang}`, req.url), { status: 303 });
}
