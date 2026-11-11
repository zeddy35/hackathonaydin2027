import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import ApplicationForm from "@/components/panel/ApplicationForm";
import OfferActions from "@/components/panel/OfferActions";
import SubmissionForm from "@/components/panel/SubmissionForm";
import TeamCard, { type TeamView } from "@/components/panel/TeamCard";
import { panelDict } from "@/content/panel";
import { formatDate } from "@/emails/templates";
import { toDraft, type ConsentKey, type Consents } from "@/lib/application";
import { isLocale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { emptySubmission } from "@/lib/submission";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getSession } from "@/lib/supabase/server";

/** Reads the session cookie on every request. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Hackathon Aydın 2027", robots: { index: false } };

type AppStatus = "draft" | "submitted" | "accepted" | "waitlisted" | "rejected" | "confirmed" | "declined" | "checked_in";

export default async function PanelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = panelDict[lang];
  const login = `${pagePath(lang, "login")}?next=${encodeURIComponent(pagePath(lang, "panel"))}`;
  if (!supabaseConfigured) redirect(login);

  const session = await getSession();
  if (!session) redirect(login);
  const { user, profile, supabase } = session;
  const role = profile?.role ?? "participant";
  const staff = role === "admin" || role === "owner" || role === "judge";

  // Fresh settings on every request (the public site caches them; the panel must not).
  const { data: settingRows } = await supabase.from("settings").select("key, value");
  const st = Object.fromEntries((settingRows ?? []).map((r) => [r.key as string, r.value as unknown]));
  const appDeadline = typeof st.application_deadline === "string" ? st.application_deadline : "2027-03-31T23:59:00+03:00";
  const rawStatus = (["upcoming", "open", "closed"].includes(st.application_status as string) ? st.application_status : "upcoming") as
    | "upcoming"
    | "open"
    | "closed";
  // Past the application deadline counts as closed, whatever the switch says (the database enforces it too).
  const appStatus = rawStatus === "open" && Date.now() >= Date.parse(appDeadline) ? "closed" : rawStatus;
  const opensLabel = (st.applications_open_label as { tr?: string; en?: string } | undefined)?.[lang] ?? (lang === "tr" ? "Ocak 2027" : "January 2027");
  const mlhEnabled = st.mlh_enabled === true;
  const confirmDeadline = typeof st.confirm_deadline === "string" ? st.confirm_deadline : null;
  const hackStart = typeof st.hack_start === "string" ? st.hack_start : "2027-04-17T11:00:00+03:00";
  const deadline = typeof st.submission_deadline === "string" ? st.submission_deadline : "2027-04-18T15:00:00+03:00";
  const now = Date.now();

  const { data: app } = await supabase
    .from("applications")
    .select("status, answers, consents, checkin_token, wants_match")
    .eq("user_id", user.id)
    .maybeSingle();
  const status = (app?.status ?? null) as AppStatus | null;
  const answers = toDraft(app?.answers);
  const firstName = answers.first_name || profile?.full_name || user.email || "";

  // Team and submission (RLS: only your own team is visible).
  let team: TeamView = null;
  let submission: Record<string, unknown> | null = null;
  let editorName = "";
  const { data: membership } = await supabase.from("team_members").select("team_id").eq("user_id", user.id).maybeSingle();
  if (membership) {
    const [{ data: teamRow }, { data: members }, { data: sub }] = await Promise.all([
      supabase.from("teams").select("id, name, join_code, locked_at").eq("id", membership.team_id).single(),
      supabase.from("team_members").select("user_id, joined_at").eq("team_id", membership.team_id).order("joined_at"),
      supabase.from("submissions").select("*").eq("team_id", membership.team_id).maybeSingle(),
    ]);
    const ids = (members ?? []).map((m) => m.user_id);
    const { data: people } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
    const nameOf = (id: string) => {
      const p = people?.find((x) => x.id === id);
      return p?.full_name || p?.email || "?";
    };
    const lockAt = typeof st.teams_lock_at === "string" ? Date.parse(st.teams_lock_at) : NaN;
    if (teamRow) {
      team = {
        name: teamRow.name,
        joinCode: teamRow.join_code,
        members: ids.map((id) => ({ id, name: nameOf(id) })),
        locked: Boolean(teamRow.locked_at) || (!Number.isNaN(lockAt) && lockAt <= now),
        hasSubmission: Boolean(sub?.submitted_at),
      };
    }
    submission = sub;
    if (sub?.updated_by) editorName = nameOf(sub.updated_by as string);
  }

  const canTeam = status === "accepted" || status === "confirmed" || status === "checked_in";
  const showQr = status === "confirmed" || status === "checked_in";
  const qrSvg = showQr && app?.checkin_token ? await QRCode.toString(app.checkin_token, { type: "svg", margin: 1, width: 240 }) : null;
  const windowOpen = now >= Date.parse(hackStart) && now < Date.parse(deadline);
  const confirmLate = Boolean(confirmDeadline && Date.parse(confirmDeadline) < now);

  const statusTitle = status ? t.status[status] : t.status.none[appStatus];
  const nextStep = !status
    ? appStatus === "upcoming"
      ? t.next.none.upcoming(opensLabel)
      : appStatus === "open"
        ? t.next.none.open(formatDate(appDeadline, lang))
        : t.next.none.closed
    : status === "draft"
      ? appStatus === "open"
        ? t.next.draft(formatDate(appDeadline, lang))
        : t.next.draftClosed
      : status === "accepted"
        ? confirmLate
          ? t.next.acceptedLate
          : t.next.accepted(confirmDeadline ? formatDate(confirmDeadline, lang) : null)
        : t.next[status];

  const consents = Object.fromEntries(
    Object.entries((app?.consents ?? {}) as Consents).map(([k, v]) => [k, Boolean(v?.accepted)])
  ) as Partial<Record<ConsentKey, boolean>>;
  const showForm = !staff && (status !== null || appStatus === "open");

  return (
    <div className="wrap grid max-w-[880px] gap-10 pb-16 pt-6 md:pb-20 md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3">
          <p className="label">Hackathon Aydın 2027</p>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere] md:text-[44px]">{t.hello(firstName)}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {staff && (
            <Link href={role === "judge" ? "/admin/juri" : "/admin"} className="btn btn-secondary">
              {t.admin}
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn btn-secondary">
              {t.signOut}
            </button>
          </form>
        </div>
      </header>

      {!profile && (
        <p role="alert" className="rounded-lg border border-accent/30 bg-accent-tint px-4 py-3">
          {t.noProfile}
        </p>
      )}

      {profile?.disabled_at ? (
        <p role="alert" className="rounded-lg border border-accent/30 bg-accent-tint px-4 py-3">
          {t.disabled}
        </p>
      ) : staff ? (
        <p className="max-w-[60ch] text-muted">{t.staffNote}</p>
      ) : (
        <>
          <Card>
            <p className="label">{t.status.label}</p>
            <p className="text-[24px] font-semibold">{statusTitle}</p>
            <p className="max-w-[60ch]">{nextStep}</p>
            {status === "accepted" && !confirmLate && (
              <>
                {confirmDeadline && (
                  <p className="text-[14px] text-muted">
                    {t.offer.deadline}: {formatDate(confirmDeadline, lang)}
                  </p>
                )}
                <OfferActions lang={lang} />
              </>
            )}
          </Card>

          {qrSvg && (
            <Card title={t.qr.title}>
              <p className="text-muted">{t.qr.body}</p>
              <div
                role="img"
                aria-label={t.qr.alt}
                className="w-full max-w-[240px] rounded-lg border border-rule bg-white p-3 [&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </Card>
          )}

          {(canTeam || status === "submitted") && (
            <Card title={t.team.title}>
              <TeamCard lang={lang} userId={user.id} team={team} canTeam={canTeam} wantsMatch={Boolean(app?.wants_match)} />
            </Card>
          )}

          {status === "checked_in" && (
            <Card title={t.submission.title}>
              {!team ? (
                <p className="text-muted">{t.submission.needTeam}</p>
              ) : (
                <>
                  <p className="text-[15px] text-muted">
                    {now < Date.parse(hackStart)
                      ? t.submission.notYet(formatDate(hackStart, lang))
                      : windowOpen
                        ? t.submission.window(formatDate(hackStart, lang), formatDate(deadline, lang))
                        : t.submission.closed}
                  </p>
                  {submission?.submitted_at ? (
                    <div className="grid gap-1 rounded-lg border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-[15px]">
                      <p className="font-semibold">{t.submission.received(formatDate(submission.submitted_at as string, lang))}</p>
                      <p className="text-muted">{t.submission.lastEdit(editorName, formatDate(submission.updated_at as string, lang))}</p>
                    </div>
                  ) : null}
                  {(windowOpen || submission) && (
                    <SubmissionForm
                      lang={lang}
                      exists={Boolean(submission)}
                      open={windowOpen}
                      initial={
                        submission
                          ? {
                              title: (submission.title as string) ?? "",
                              problem: (submission.problem as string) ?? "",
                              description: (submission.description as string) ?? "",
                              repo_url: (submission.repo_url as string) ?? "",
                              ai_tools: (submission.ai_tools as string) ?? "",
                              demo_url: (submission.demo_url as string) ?? "",
                              demo_is_local: Boolean(submission.demo_is_local),
                              slides_url: (submission.slides_url as string) ?? "",
                            }
                          : emptySubmission
                      }
                    />
                  )}
                </>
              )}
            </Card>
          )}

          {showForm && (
            <Card title={status && status !== "draft" ? t.form.viewTitle : t.form.title}>
              <ApplicationForm
                lang={lang}
                userId={user.id}
                email={user.email ?? profile?.email ?? ""}
                initial={answers}
                initialConsents={consents}
                locked={Boolean(status && status !== "draft")}
                canSubmit={appStatus === "open" && (!status || status === "draft")}
                mlhEnabled={mlhEnabled}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-xl border border-rule bg-surface p-5 md:p-8">
      {title && <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>}
      {children}
    </section>
  );
}
