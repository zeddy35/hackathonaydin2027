"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/data";
import { notify } from "@/emails/notify";
import { renderCustom, type TemplateKey, TEMPLATE_KEYS } from "@/emails/templates";
import { assertRole, AuthError, dbCode, JURY, STAFF } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import type { Locale } from "@/lib/i18n";
import { ROUNDS, type Round } from "@/lib/judging";
import { siteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Admin and jury actions. Each one checks the caller's role on the server first,
 * then works through the caller's own Supabase client, so row level security and
 * the database triggers (owner rules, audit log, status rules) still apply.
 * The service-role client is used only for auth admin calls (invite, ban).
 */

export type AdminResult = { ok: boolean; code?: string; message?: string; count?: number; emailSkipped?: boolean; data?: unknown };

const DB_CODES = [
  "owner_only",
  "last_owner",
  "own_role",
  "owner_cannot_be_deleted",
  "owner_cannot_be_disabled",
  "disable_not_allowed",
  "role_change_not_allowed",
  "team_full",
  "round_closed",
  "invalid_score",
  "duplicate key",
] as const;

async function guard(roles: typeof STAFF, fn: (ctx: Awaited<ReturnType<typeof assertRole>>) => Promise<AdminResult>): Promise<AdminResult> {
  try {
    const ctx = await assertRole(roles);
    return await fn(ctx);
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, code: "forbidden" };
    console.error("admin action failed:", e);
    return { ok: false, code: "unknown" };
  }
}

const err = (e: { message?: string; code?: string } | null): AdminResult => ({ ok: false, code: dbCode(e, DB_CODES) });

async function audit(db: SupabaseClient, actor: string, action: string, targetType: string | null, targetId: string | null, details: Record<string, unknown> = {}) {
  await db.from("audit_log").insert({ actor_id: actor, action, target_type: targetType, target_id: targetId, details });
}

const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
const uuids = (ids: string[]) => ids.filter(isUuid).slice(0, 1000);

/* ------------------------------------------------------------------ applications */

type Decision = "accepted" | "waitlisted" | "rejected";

export async function decideApplications(ids: string[], status: Decision, sendMail: boolean) {
  return guard(STAFF, async ({ supabase }) => {
    if (!["accepted", "waitlisted", "rejected"].includes(status)) return { ok: false, code: "invalid" };
    const list = uuids(ids);
    if (!list.length) return { ok: false, code: "nothing_selected" };
    // Only applications that were submitted or already decided can be decided again.
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .in("id", list)
      .in("status", ["submitted", "accepted", "waitlisted", "rejected"])
      .select("id, user_id, answers");
    if (error) return err(error);

    let emailSkipped = false;
    if (sendMail && data?.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, email, locale").in("id", data.map((a) => a.user_id));
      const { data: deadline } = await supabase.from("settings").select("value").eq("key", "confirm_deadline").maybeSingle();
      for (const a of data) {
        const p = profiles?.find((x) => x.id === a.user_id);
        if (!p) continue;
        const r = await notify(
          { email: p.email, locale: p.locale === "en" ? "en" : "tr", name: (a.answers as Record<string, string>)?.first_name },
          status,
          { deadline: typeof deadline?.value === "string" ? deadline.value : null }
        );
        if (r.skipped) {
          emailSkipped = true;
          break;
        }
      }
    }
    revalidatePath("/admin", "layout");
    return { ok: true, count: data?.length ?? 0, emailSkipped };
  });
}

export async function addNote(applicationId: string, body: string) {
  return guard(STAFF, async ({ supabase }) => {
    const text = body.trim();
    if (!isUuid(applicationId) || !text || text.length > 2000) return { ok: false, code: "invalid" };
    const { error } = await supabase.from("application_notes").insert({ application_id: applicationId, body: text });
    if (error) return err(error);
    revalidatePath(`/admin/basvurular/${applicationId}`);
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ check-in */

export type CheckinInfo = {
  id: string;
  name: string;
  university: string;
  team: string | null;
  diet: string;
  hasEmergency: boolean;
  status: string;
  checkedInAt: string | null;
  minor: boolean;
};

async function checkinInfo(db: SupabaseClient, app: Record<string, unknown>): Promise<CheckinInfo> {
  const a = (app.answers ?? {}) as Record<string, string>;
  const { data: m } = await db.from("team_members").select("teams(name)").eq("user_id", app.user_id as string).maybeSingle();
  const team = (m?.teams as unknown as { name: string } | null)?.name ?? null;
  return {
    id: app.id as string,
    name: `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || "?",
    university: a.university ?? "",
    team,
    diet: a.diet ?? "",
    hasEmergency: Boolean(a.emergency_name && a.emergency_phone),
    status: app.status as string,
    checkedInAt: (app.checked_in_at as string) ?? null,
    minor: Boolean(app.is_minor),
  };
}

/** Looks up a participant by QR token, or by name/email when typed by hand. */
export async function lookupCheckin(query: string) {
  return guard(STAFF, async ({ supabase }) => {
    const q = query.trim();
    if (q.length < 3 || q.length > 200) return { ok: false, code: "invalid" };
    const cols = "id, user_id, status, answers, checked_in_at, is_minor, checkin_token";
    if (/^[0-9a-f]{64}$/i.test(q)) {
      const { data } = await supabase.from("applications").select(cols).eq("checkin_token", q.toLowerCase()).maybeSingle();
      if (!data) return { ok: false, code: "not_found" };
      return { ok: true, data: [await checkinInfo(supabase, data)] };
    }
    const like = `%${q.replace(/[%_,()]/g, " ")}%`;
    const { data: profiles } = await supabase.from("profiles").select("id").or(`email.ilike.${like},full_name.ilike.${like}`).limit(10);
    if (!profiles?.length) return { ok: false, code: "not_found" };
    const { data: apps } = await supabase.from("applications").select(cols).in("user_id", profiles.map((p) => p.id));
    if (!apps?.length) return { ok: false, code: "not_found" };
    return { ok: true, data: await Promise.all(apps.map((a) => checkinInfo(supabase, a))) };
  });
}

export async function checkIn(applicationId: string) {
  return guard(STAFF, async ({ supabase }) => {
    if (!isUuid(applicationId)) return { ok: false, code: "invalid" };
    const { data: app } = await supabase.from("applications").select("status").eq("id", applicationId).maybeSingle();
    if (!app) return { ok: false, code: "not_found" };
    if (app.status === "checked_in") return { ok: false, code: "already_checked_in" };
    if (app.status !== "confirmed") return { ok: false, code: app.status === "accepted" ? "not_confirmed" : "not_accepted" };
    const { error } = await supabase.from("applications").update({ status: "checked_in" }).eq("id", applicationId).eq("status", "confirmed");
    if (error) return err(error);
    revalidatePath("/admin/checkin");
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ teams */

export async function adminCreateTeam(name: string) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const n = name.trim();
    if (!n || n.length > 60) return { ok: false, code: "invalid" };
    const { data, error } = await supabase.from("teams").insert({ name: n, created_by: profile.id }).select("id").single();
    if (error) return err(error);
    await audit(supabase, profile.id, "team_create", "team", data.id, { name: n });
    revalidatePath("/admin/takimlar");
    return { ok: true };
  });
}

export async function adminAddMember(teamId: string, userId: string) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!isUuid(teamId) || !isUuid(userId)) return { ok: false, code: "invalid" };
    await supabase.from("team_members").delete().eq("user_id", userId);
    const { error } = await supabase.from("team_members").insert({ team_id: teamId, user_id: userId });
    if (error) return err(error);
    await supabase.from("applications").update({ wants_match: false }).eq("user_id", userId);
    await audit(supabase, profile.id, "team_add_member", "team", teamId, { user_id: userId });
    revalidatePath("/admin/takimlar");
    return { ok: true };
  });
}

export async function adminRemoveMember(teamId: string, userId: string) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!isUuid(teamId) || !isUuid(userId)) return { ok: false, code: "invalid" };
    const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId);
    if (error) return err(error);
    await audit(supabase, profile.id, "team_remove_member", "team", teamId, { user_id: userId });
    revalidatePath("/admin/takimlar");
    return { ok: true };
  });
}

export async function setTeamLock(teamId: string | "all", locked: boolean) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const value = locked ? new Date().toISOString() : null;
    const q = supabase.from("teams").update({ locked_at: value });
    const { error } = teamId === "all" ? await q.not("id", "is", null) : isUuid(teamId) ? await q.eq("id", teamId) : { error: { message: "invalid" } };
    if (error) return err(error);
    await audit(supabase, profile.id, locked ? "team_lock" : "team_unlock", "team", teamId, {});
    revalidatePath("/admin/takimlar");
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ judging */

export async function assignJudge(submissionId: string, judgeId: string, assign: boolean) {
  return guard(STAFF, async ({ supabase }) => {
    if (!isUuid(submissionId) || !isUuid(judgeId)) return { ok: false, code: "invalid" };
    const { error } = assign
      ? await supabase.from("judge_assignments").upsert({ submission_id: submissionId, judge_id: judgeId })
      : await supabase.from("judge_assignments").delete().eq("submission_id", submissionId).eq("judge_id", judgeId);
    if (error) return err(error);
    revalidatePath("/admin/puanlama");
    return { ok: true };
  });
}

/** Gives every submission at least `perTeam` judges, spreading the load evenly. Keeps existing assignments. */
export async function autoAssign(perTeam: number) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const n = Math.max(2, Math.min(10, Math.floor(perTeam)));
    const [{ data: subs }, { data: judges }, { data: current }] = await Promise.all([
      supabase.from("submissions").select("id").order("created_at"),
      supabase.from("profiles").select("id").eq("role", "judge").is("disabled_at", null),
      supabase.from("judge_assignments").select("submission_id, judge_id"),
    ]);
    if (!judges?.length || judges.length < n) return { ok: false, code: "not_enough_judges" };
    const load = new Map(judges.map((j) => [j.id, 0]));
    for (const c of current ?? []) if (load.has(c.judge_id)) load.set(c.judge_id, (load.get(c.judge_id) ?? 0) + 1);
    const rows: { submission_id: string; judge_id: string }[] = [];
    for (const s of subs ?? []) {
      const have = new Set((current ?? []).filter((c) => c.submission_id === s.id).map((c) => c.judge_id));
      while (have.size < n) {
        const pick = [...load.entries()].filter(([id]) => !have.has(id)).sort((a, b) => a[1] - b[1])[0];
        if (!pick) break;
        have.add(pick[0]);
        load.set(pick[0], pick[1] + 1);
        rows.push({ submission_id: s.id, judge_id: pick[0] });
      }
    }
    if (rows.length) {
      const { error } = await supabase.from("judge_assignments").insert(rows);
      if (error) return err(error);
    }
    await audit(supabase, profile.id, "judges_auto_assign", null, null, { per_team: n, added: rows.length });
    revalidatePath("/admin/puanlama");
    return { ok: true, count: rows.length };
  });
}

export async function saveScore(submissionId: string, round: Round, values: Record<string, number>, comment: string) {
  return guard(JURY, async ({ supabase, profile }) => {
    if (!isUuid(submissionId) || !ROUNDS.includes(round)) return { ok: false, code: "invalid" };
    const criteria: Record<string, number> = {};
    for (const [k, v] of Object.entries(values)) {
      if (!/^[a-z_]{1,40}$/.test(k) || !Number.isInteger(v) || v < 1 || v > 10) return { ok: false, code: "invalid_score" };
      criteria[k] = v;
    }
    const { error } = await supabase
      .from("scores")
      .upsert(
        { submission_id: submissionId, judge_id: profile.id, round, criteria, comment: comment.trim().slice(0, 2000) || null },
        { onConflict: "submission_id,judge_id,round" }
      );
    if (error) return err(error);
    revalidatePath("/admin/juri");
    return { ok: true };
  });
}

export async function setFinalists(ids: string[]) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const list = uuids(ids);
    const { error: e1 } = await supabase.from("submissions").update({ finalist: false }).eq("finalist", true);
    if (e1) return err(e1);
    if (list.length) {
      const { error } = await supabase.from("submissions").update({ finalist: true }).in("id", list);
      if (error) return err(error);
    }
    await audit(supabase, profile.id, "finalists_set", null, null, { submission_ids: list });
    revalidatePath("/admin/puanlama");
    return { ok: true, count: list.length };
  });
}

async function setSetting(db: SupabaseClient, actor: string, key: string, value: unknown) {
  const { error } = await db.from("settings").update({ value, updated_by: actor }).eq("key", key);
  return error;
}

export async function setRoundClosed(round: Round, closed: boolean) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!ROUNDS.includes(round)) return { ok: false, code: "invalid" };
    const { data } = await supabase.from("settings").select("value").eq("key", "closed_rounds").maybeSingle();
    const now = new Set<string>(Array.isArray(data?.value) ? data.value : []);
    if (closed) now.add(round);
    else now.delete(round);
    const e = await setSetting(supabase, profile.id, "closed_rounds", [...now]);
    if (e) return err(e);
    await audit(supabase, profile.id, closed ? "round_close" : "round_open", "round", round, {});
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}

export async function saveCriteria(list: { key: string; tr: string; en: string; weight: number }[]) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const clean = list.map((c) => ({
      key: c.key.trim().toLowerCase().replace(/[^a-z_]/g, "_").slice(0, 40),
      tr: c.tr.trim().slice(0, 80),
      en: c.en.trim().slice(0, 80),
      weight: Math.max(0, Math.min(100, Math.round(Number(c.weight) || 0))),
    }));
    if (!clean.length || clean.some((c) => !c.key || !c.tr || !c.en) || new Set(clean.map((c) => c.key)).size !== clean.length)
      return { ok: false, code: "invalid" };
    const e = await setSetting(supabase, profile.id, "judging_criteria", clean);
    if (e) return err(e);
    await audit(supabase, profile.id, "criteria_update", "setting", "judging_criteria", { criteria: clean });
    revalidatePath("/admin/puanlama");
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ content */

export type SettingsInput = {
  application_status: "upcoming" | "open" | "closed";
  opens_tr: string;
  opens_en: string;
  hack_start: string;
  submission_deadline: string;
  confirm_deadline: string;
  teams_lock_at: string;
  mlh_enabled: boolean;
  mlh_badge: boolean;
  mlh_badge_href: string;
  mlh_badge_image: string;
};

/** datetime-local value (Türkiye time, no offset) → ISO with +03:00. Türkiye has no DST. */
const istanbul = (v: string) => (v ? (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+03:00` : null) : "");

export async function saveSettings(input: SettingsInput) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!["upcoming", "open", "closed"].includes(input.application_status)) return { ok: false, code: "invalid" };
    const times = {
      hack_start: istanbul(input.hack_start),
      submission_deadline: istanbul(input.submission_deadline),
      confirm_deadline: istanbul(input.confirm_deadline),
      teams_lock_at: istanbul(input.teams_lock_at),
    };
    if (Object.values(times).some((v) => v === null) || !times.hack_start || !times.submission_deadline) return { ok: false, code: "invalid_date" };
    const urlOk = (u: string) => u === "" || /^https:\/\/\S+$/.test(u);
    if (!urlOk(input.mlh_badge_href) || !urlOk(input.mlh_badge_image)) return { ok: false, code: "invalid_url" };
    if (input.mlh_badge && (!input.mlh_badge_href || !input.mlh_badge_image)) return { ok: false, code: "mlh_badge_incomplete" };

    const values: Record<string, unknown> = {
      application_status: input.application_status,
      applications_open_label: { tr: input.opens_tr.trim().slice(0, 40), en: input.opens_en.trim().slice(0, 40) },
      hack_start: times.hack_start,
      submission_deadline: times.submission_deadline,
      confirm_deadline: times.confirm_deadline || null,
      teams_lock_at: times.teams_lock_at || null,
      mlh_enabled: Boolean(input.mlh_enabled),
      mlh_badge: Boolean(input.mlh_badge),
      mlh_badge_href: input.mlh_badge_href.trim(),
      mlh_badge_image: input.mlh_badge_image.trim(),
    };
    for (const [k, v] of Object.entries(values)) {
      const e = await setSetting(supabase, profile.id, k, v);
      if (e) return err(e);
    }
    await audit(supabase, profile.id, "settings_update", "setting", null, values);
    revalidateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
    return { ok: true };
  });
}

export type SponsorInput = { id: string; name: string; tier: string; logo: string; url: string; sort_order: number; published: boolean };
export type PersonInput = { id: string; name: string; role: string; org: string; photo: string; url: string; kind: string; sort_order: number; published: boolean };

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || `item-${Date.now()}`;

const okUrl = (u: string, required: boolean) => (u ? /^https:\/\/\S+$/.test(u) || /^\/[\w./-]+$/.test(u) : !required);

export async function saveSponsor(input: SponsorInput) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const tiers = ["title", "gold", "silver", "inkind", "tech", "community"];
    if (!input.name.trim() || !tiers.includes(input.tier) || !okUrl(input.url, true) || !okUrl(input.logo, false)) return { ok: false, code: "invalid" };
    const row = {
      id: input.id || slug(input.name),
      name: input.name.trim().slice(0, 120),
      tier: input.tier,
      logo: input.logo || null,
      url: input.url.trim(),
      sort_order: Math.round(Number(input.sort_order) || 0),
      published: Boolean(input.published),
    };
    const { error } = await supabase.from("sponsors").upsert(row);
    if (error) return err(error);
    await audit(supabase, profile.id, "sponsor_save", "sponsor", row.id, { name: row.name, published: row.published });
    revalidateTag(CONTENT_TAG);
    revalidatePath("/admin/icerik");
    return { ok: true };
  });
}

export async function deleteSponsor(id: string) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) return err(error);
    await audit(supabase, profile.id, "sponsor_delete", "sponsor", id, {});
    revalidateTag(CONTENT_TAG);
    revalidatePath("/admin/icerik");
    return { ok: true };
  });
}

export async function savePerson(input: PersonInput) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!input.name.trim() || !["judge", "mentor"].includes(input.kind) || !okUrl(input.url, false) || !okUrl(input.photo, false))
      return { ok: false, code: "invalid" };
    const row = {
      id: input.id || slug(input.name),
      name: input.name.trim().slice(0, 120),
      role: input.role.trim().slice(0, 120),
      org: input.org.trim().slice(0, 120),
      photo: input.photo || null,
      url: input.url || null,
      kind: input.kind,
      sort_order: Math.round(Number(input.sort_order) || 0),
      published: Boolean(input.published),
    };
    const { error } = await supabase.from("people").upsert(row);
    if (error) return err(error);
    await audit(supabase, profile.id, "person_save", "person", row.id, { name: row.name, published: row.published });
    revalidateTag(CONTENT_TAG);
    revalidatePath("/admin/icerik");
    return { ok: true };
  });
}

export async function deletePerson(id: string) {
  return guard(STAFF, async ({ supabase, profile }) => {
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) return err(error);
    await audit(supabase, profile.id, "person_delete", "person", id, {});
    revalidateTag(CONTENT_TAG);
    revalidatePath("/admin/icerik");
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ accounts */

type StaffRole = "participant" | "judge" | "admin" | "owner";

export async function setRole(userId: string, role: StaffRole) {
  return guard(STAFF, async ({ supabase }) => {
    if (!isUuid(userId) || !["participant", "judge", "admin", "owner"].includes(role)) return { ok: false, code: "invalid" };
    // The database decides: only owners touch owners, nobody raises their own role, the last owner stays.
    const { data, error } = await supabase.from("profiles").update({ role }).eq("id", userId).select("id");
    if (error) return err(error);
    if (!data?.length) return { ok: false, code: "forbidden" };
    revalidatePath("/admin/hesaplar");
    return { ok: true };
  });
}

/** Adds an admin or judge by email. Existing accounts get the role; new people get an invitation email with a sign-in link. */
export async function inviteStaff(email: string, role: "admin" | "judge") {
  return guard(STAFF, async ({ supabase, profile }) => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !["admin", "judge"].includes(role)) return { ok: false, code: "invalid" };
    const { data: existing } = await supabase.from("profiles").select("id, role").ilike("email", e).maybeSingle();
    if (existing) {
      if (existing.role === "owner") return { ok: false, code: "owner_only" };
      const { error } = await supabase.from("profiles").update({ role }).eq("id", existing.id);
      if (error) return err(error);
      revalidatePath("/admin/hesaplar");
      return { ok: true, message: "role_set" };
    }
    const admin = createAdminClient();
    if (!admin) return { ok: false, code: "service_key_missing" };
    const { data, error } = await admin.auth.admin.inviteUserByEmail(e, {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(role === "judge" ? "/admin/juri" : "/admin")}`,
    });
    if (error || !data.user) return { ok: false, code: "invite_failed", message: error?.message };
    // Set the role as the inviting admin, so the database rules and audit log apply.
    const { error: roleError } = await supabase.from("profiles").update({ role }).eq("id", data.user.id);
    if (roleError) return err(roleError);
    await audit(supabase, profile.id, "invite", "profile", data.user.id, { email: e, role });
    revalidatePath("/admin/hesaplar");
    return { ok: true, message: "invited" };
  });
}

export async function setDisabled(userId: string, disabled: boolean) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (!isUuid(userId)) return { ok: false, code: "invalid" };
    const { data, error } = await supabase
      .from("profiles")
      .update({ disabled_at: disabled ? new Date().toISOString() : null })
      .eq("id", userId)
      .select("id");
    if (error) return err(error);
    if (!data?.length) return { ok: false, code: "forbidden" };
    // Also block sign-in at the auth level when the service key is available.
    const admin = createAdminClient();
    let message = "app_only";
    if (admin) {
      const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: disabled ? "876000h" : "none" });
      if (!banError) message = "banned";
    }
    await audit(supabase, profile.id, disabled ? "account_disable" : "account_enable", "profile", userId, { auth_ban: message === "banned" });
    revalidatePath("/admin/hesaplar");
    return { ok: true, message };
  });
}

/* ------------------------------------------------------------------ bulk email */

export type BulkEmailInput = {
  statuses: string[];
  /** A template key, or "custom" for free text. */
  template: TemplateKey | "custom";
  subject: string;
  body: string;
  /** Only people who opted in to announcements. */
  marketingOnly: boolean;
};

async function recipients(db: SupabaseClient, input: BulkEmailInput) {
  const valid = ["submitted", "accepted", "waitlisted", "rejected", "confirmed", "declined", "checked_in"];
  const statuses = input.statuses.filter((s) => valid.includes(s));
  if (!statuses.length) return [];
  const { data: apps } = await db.from("applications").select("user_id, answers, consents, checkin_token").in("status", statuses);
  const list = (apps ?? []).filter((a) => !input.marketingOnly || (a.consents as Record<string, { accepted?: boolean }>)?.marketing?.accepted === true);
  if (!list.length) return [];
  const { data: profiles } = await db.from("profiles").select("id, email, locale").in("id", list.map((a) => a.user_id));
  return list.flatMap((a) => {
    const p = profiles?.find((x) => x.id === a.user_id);
    return p
      ? [{ email: p.email as string, locale: (p.locale === "en" ? "en" : "tr") as Locale, name: (a.answers as Record<string, string>)?.first_name, checkinToken: a.checkin_token as string }]
      : [];
  });
}

export async function countRecipients(input: BulkEmailInput) {
  return guard(STAFF, async ({ supabase }) => ({ ok: true, count: (await recipients(supabase, input)).length }));
}

export async function sendBulkEmail(input: BulkEmailInput) {
  return guard(STAFF, async ({ supabase, profile }) => {
    if (input.template !== "custom" && !TEMPLATE_KEYS.includes(input.template)) return { ok: false, code: "invalid" };
    if (input.template === "custom" && (!input.subject.trim() || !input.body.trim())) return { ok: false, code: "invalid" };
    const list = await recipients(supabase, input);
    if (!list.length) return { ok: false, code: "no_recipients" };
    const { data: deadline } = await supabase.from("settings").select("value").eq("key", "confirm_deadline").maybeSingle();
    let sent = 0;
    let skipped = false;
    let failed = 0;
    for (const r of list) {
      const res =
        input.template === "custom"
          ? await (async () => {
              const t = renderCustom(r.locale, input.subject.trim().slice(0, 150), input.body.slice(0, 5000), r.name);
              return sendEmail({ to: r.email, subject: t.subject, html: t.html, text: t.text });
            })()
          : await notify(r, input.template, { message: input.body.trim() || undefined, deadline: typeof deadline?.value === "string" ? deadline.value : null });
      if (res.skipped) {
        skipped = true;
        break;
      }
      sent += res.sent;
      failed += res.failed;
    }
    await audit(supabase, profile.id, "bulk_email", null, null, {
      template: input.template,
      statuses: input.statuses,
      marketing_only: input.marketingOnly,
      recipients: list.length,
      sent,
      failed,
      skipped,
    });
    return { ok: !skipped, code: skipped ? "email_not_configured" : undefined, count: sent, message: failed ? `${failed}` : undefined, emailSkipped: skipped };
  });
}
