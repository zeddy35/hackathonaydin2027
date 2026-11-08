import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Per-request client acting as the signed-in user (RLS applies). */
export async function createClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead.
        }
      },
    },
  });
}

export type Role = "participant" | "judge" | "admin" | "owner";
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  locale: "tr" | "en";
  disabled_at: string | null;
};

/** Signed-in user and profile, or null. Role always comes from the database. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, locale, disabled_at")
    .eq("id", user.id)
    .single<Profile>();
  return { user, profile, supabase };
}
