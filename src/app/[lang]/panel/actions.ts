"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { notify } from "@/emails/notify";
import {
  draftSchema,
  mergeConsents,
  requiredConsents,
  submitSchema,
  visibleConsents,
  type ConsentKey,
  type Consents,
  type DraftAnswers,
} from "@/lib/application";
import { dbCode } from "@/lib/auth";
import { checkRepoPublic, type RepoCheck } from "@/lib/github";
import type { Locale } from "@/lib/i18n";
import { fieldErrors, submissionSchema, type SubmissionInput } from "@/lib/submission";
import { getSession } from "@/lib/supabase/server";

/*
 * Participant actions. Every action re-reads the session and works through the
 * user's own Supabase client, so row level security and the database triggers
 * decide what is allowed; these functions only validate input and map errors.
 */

export type ActionResult = {
  ok: boolean;
  /** Stable code for the form to translate. */
  code?: string;
  errors?: Record<string, string>;
  /** True when an email would have gone out but email is not configured. */
  emailSkipped?: boolean;
  repo?: RepoCheck;
};

const DB_CODES = [
  "applications_not_open",
  "application_locked_after_submit",
  "status_change_not_allowed",
  "confirm_deadline_passed",
  "team_full",
  "team_not_found",
  "already_in_team",
  "teams_locked",
  "team_has_submission",
  "not_in_team",
  "application_not_accepted",
  "participants_only",
] as const;

const fail = (code: string, errors?: Record<string, string>): ActionResult => ({ ok: false, code, errors });

async function participant() {
  const s = await getSession();
  if (!s?.profile || s.profile.disabled_at) return null;
  return { ...s, profile: s.profile };
}

async function publicSettings(supabase: SupabaseClient) {
  const { data } = await supabase.from("settings").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as unknown]));
}

export async function saveApplication(
  lang: Locale,
  input: DraftAnswers,
  consentInput: Partial<Record<ConsentKey, boolean>>,
  submit: boolean
): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  if (s.profile.role !== "participant") return fail("participants_only");
  const { supabase, user } = s;

  const draft = draftSchema.safeParse(input, { reportInput: true });
  if (!draft.success) return fail("validation", fieldErrors(draft.error.issues));

  const settings = await publicSettings(supabase);
  const mlh = settings.mlh_enabled === true;
  const { data: existing } = await supabase
    .from("applications")
    .select("id, status, answers, consents")
    .eq("user_id", user.id)
    .maybeSingle();

  const locked = existing && existing.status !== "draft";
  let answers: Record<string, unknown> = draft.data;
  let consents: Consents;

  if (locked) {
    // After submitting, only logistics fields and optional marketing consents can change.
    const editable = ["phone", "tshirt", "diet", "emergency_name", "emergency_phone", "github", "linkedin", "portfolio", "cv_path"];
    answers = { ...(existing.answers as Record<string, unknown>) };
    for (const k of editable) answers[k] = (draft.data as Record<string, unknown>)[k];
    const strict = submitSchema.pick({ phone: true, emergency_name: true, emergency_phone: true, github: true, linkedin: true, portfolio: true }).safeParse(answers, { reportInput: true });
    if (!strict.success) return fail("validation", fieldErrors(strict.error.issues));
    consents = mergeConsents(existing.consents as Consents, consentInput, mlh ? ["marketing", "mlh_marketing"] : ["marketing"]);
  } else {
    consents = mergeConsents((existing?.consents ?? {}) as Consents, consentInput, visibleConsents(mlh));
    if (submit) {
      if (settings.application_status !== "open") return fail("applications_not_open");
      const strict = submitSchema.safeParse(draft.data, { reportInput: true });
      const errors = strict.success ? {} : fieldErrors(strict.error.issues);
      for (const k of requiredConsents(mlh)) if (!consents[k]?.accepted) errors[`consent_${k}`] = "consent";
      if (Object.keys(errors).length) return fail("validation", errors);
    }
  }

  const status = locked ? existing.status : submit ? "submitted" : "draft";
  const { error } = existing
    ? await supabase.from("applications").update({ answers, consents, status }).eq("id", existing.id)
    : await supabase.from("applications").insert({ user_id: user.id, answers, consents, status });
  if (error) return fail(dbCode(error, DB_CODES));

  const fullName = `${draft.data.first_name} ${draft.data.last_name}`.trim();
  if (fullName && !locked) await supabase.from("profiles").update({ full_name: fullName, locale: lang }).eq("id", user.id);

  let emailSkipped = false;
  if (!locked && submit) {
    const r = await notify({ email: s.profile.email, locale: lang, name: draft.data.first_name }, "received");
    emailSkipped = r.skipped;
  }
  revalidatePath(`/${lang}/panel`);
  return { ok: true, emailSkipped };
}

export async function respondToOffer(lang: Locale, decision: "confirmed" | "declined"): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  if (decision !== "confirmed" && decision !== "declined") return fail("invalid");
  const { data, error } = await s.supabase
    .from("applications")
    .update({ status: decision })
    .eq("user_id", s.user.id)
    .eq("status", "accepted")
    .select("checkin_token, answers")
    .maybeSingle();
  if (error) return fail(dbCode(error, DB_CODES));
  if (!data) return fail("status_change_not_allowed");

  let emailSkipped = false;
  if (decision === "confirmed") {
    const first = (data.answers as Record<string, string>)?.first_name;
    const r = await notify({ email: s.profile.email, locale: lang, name: first, checkinToken: data.checkin_token }, "confirmed");
    emailSkipped = r.skipped;
  }
  revalidatePath(`/${lang}/panel`);
  return { ok: true, emailSkipped };
}

export async function setWantsMatch(lang: Locale, value: boolean): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  const { error } = await s.supabase.from("applications").update({ wants_match: value }).eq("user_id", s.user.id);
  if (error) return fail(dbCode(error, DB_CODES));
  revalidatePath(`/${lang}/panel`);
  return { ok: true };
}

export async function createTeam(lang: Locale, name: string): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  const clean = name.trim();
  if (clean.length < 1 || clean.length > 60) return fail("validation", { team_name: clean ? "too_long" : "required" });
  const { error } = await s.supabase.rpc("create_team", { team_name: clean });
  if (error) return fail(dbCode(error, DB_CODES));
  await s.supabase.from("applications").update({ wants_match: false }).eq("user_id", s.user.id);
  revalidatePath(`/${lang}/panel`);
  return { ok: true };
}

export async function joinTeam(lang: Locale, code: string): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{6,8}$/.test(clean)) return fail("validation", { join_code: clean ? "invalid" : "required" });
  const { error } = await s.supabase.rpc("join_team", { code: clean });
  if (error) return fail(dbCode(error, DB_CODES));
  await s.supabase.from("applications").update({ wants_match: false }).eq("user_id", s.user.id);
  revalidatePath(`/${lang}/panel`);
  return { ok: true };
}

export async function leaveTeam(lang: Locale): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  const { error } = await s.supabase.rpc("leave_team");
  if (error) return fail(dbCode(error, DB_CODES));
  revalidatePath(`/${lang}/panel`);
  return { ok: true };
}

export async function saveSubmission(lang: Locale, input: SubmissionInput): Promise<ActionResult> {
  const s = await participant();
  if (!s) return fail("signed_out");
  const parsed = submissionSchema.safeParse(input, { reportInput: true });
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error.issues));
  const v = parsed.data;

  const { data: member } = await s.supabase.from("team_members").select("team_id").eq("user_id", s.user.id).maybeSingle();
  if (!member) return fail("not_in_team");

  const row = {
    team_id: member.team_id,
    title: v.title,
    problem: v.problem,
    description: v.description,
    repo_url: v.repo_url,
    ai_tools: v.ai_tools,
    demo_url: v.demo_url || null,
    demo_is_local: v.demo_is_local,
    slides_url: v.slides_url || null,
  };
  const { data: existing } = await s.supabase.from("submissions").select("id").eq("team_id", member.team_id).maybeSingle();
  const { data: saved, error } = existing
    ? await s.supabase.from("submissions").update(row).eq("id", existing.id).select("id").maybeSingle()
    : await s.supabase.from("submissions").insert(row).select("id").maybeSingle();
  // RLS hides the row when the window is closed or the member is not checked in.
  if (error || !saved) {
    const code = error ? dbCode(error, DB_CODES) : "submission_closed";
    return fail(code === "forbidden" ? "submission_closed" : code);
  }

  const repo = await checkRepoPublic(v.repo_url);

  let emailSkipped = false;
  if (!existing) {
    // Teammates' profiles are readable to members (RLS), so the whole team gets the receipt.
    const { data: mates } = await s.supabase.from("team_members").select("user_id").eq("team_id", member.team_id);
    const { data: profiles } = await s.supabase
      .from("profiles")
      .select("email, locale")
      .in("id", (mates ?? []).map((m) => m.user_id));
    for (const p of profiles ?? []) {
      const r = await notify({ email: p.email, locale: p.locale === "en" ? "en" : "tr" }, "submission", { title: v.title });
      emailSkipped ||= r.skipped;
    }
  }
  revalidatePath(`/${lang}/panel`);
  return { ok: true, emailSkipped, repo };
}
