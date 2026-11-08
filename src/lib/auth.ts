import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigured } from "./supabase/env";
import { getSession, type Role } from "./supabase/server";

export const STAFF: Role[] = ["admin", "owner"];
export const JURY: Role[] = ["judge", "admin", "owner"];

/**
 * For admin pages: the signed-in profile with one of `roles`, read from the
 * database on every request. Otherwise redirects to login or the no-access page.
 */
export async function requireRole(roles: Role[], next = "/admin") {
  if (!supabaseConfigured) redirect(`/tr/giris?next=${encodeURIComponent(next)}`);
  const session = await getSession();
  if (!session) redirect(`/tr/giris?next=${encodeURIComponent(next)}`);
  const { profile } = session;
  if (profile?.role === "judge" && !profile.disabled_at && !roles.includes("judge")) redirect("/admin/juri");
  if (!profile || profile.disabled_at || !roles.includes(profile.role)) redirect("/admin/yetki-yok");
  return { ...session, profile };
}

export class AuthError extends Error {}

/** For server actions: same check, but throws instead of redirecting. */
export async function assertRole(roles: Role[]) {
  if (!supabaseConfigured) throw new AuthError("not_configured");
  const session = await getSession();
  const profile = session?.profile;
  if (!session || !profile || profile.disabled_at || !roles.includes(profile.role)) throw new AuthError("forbidden");
  return { ...session, profile };
}

/** Finds a stable error code raised by the database (see the migrations) in an error message. */
export function dbCode(err: { message?: string; code?: string } | null | undefined, known: readonly string[]): string {
  if (!err) return "unknown";
  const msg = err.message ?? "";
  const hit = known.find((k) => msg.includes(k));
  if (hit) return hit;
  if (err.code === "42501" || msg.includes("row-level security")) return "forbidden";
  return "unknown";
}
