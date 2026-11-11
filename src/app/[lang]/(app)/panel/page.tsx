import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import ApplicationForm from "@/components/panel/ApplicationForm";
import Countdown from "@/components/panel/Countdown";
import OfferActions from "@/components/panel/OfferActions";
import Stepper, { type Step, type StepState } from "@/components/panel/Stepper";
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
  const submitted = Boolean(submission?.submitted_at);

  // Progress steps: apply, review, confirm, check-in, submit.
  const short = (iso: string) =>
    new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" }).format(new Date(iso));
  const reached = (
    { draft: 0, submitted: 1, waitlisted: 1, rejected: 1, accepted: 2, declined: 2, confirmed: 3, checked_in: 4 } as Record<AppStatus, number>
  )[status ?? "draft"];
  const stoppedAt = status === "waitlisted" || status === "rejected" || status === "declined" ? reached : -1;
  const stepState = (i: number): StepState =>
    i === stoppedAt ? "stopped" : i < reached || (i === 4 && submitted) ? "done" : i === reached && stoppedAt === -1 ? "current" : "todo";
  const steps: Step[] = [
    { label: t.steps.apply, note: reached === 0 && appStatus === "open" ? short(appDeadline) : undefined },
    { label: t.steps.review, note: stoppedAt === 1 ? statusTitle : undefined },
    { label: t.steps.confirm, note: stoppedAt === 2 ? statusTitle : reached === 2 && confirmDeadline ? short(confirmDeadline) : undefined },
    { label: t.steps.checkin, note: short(hackStart) },
    { label: t.steps.submit, note: reached === 4 && !submitted ? short(deadline) : undefined },
  ].map((s, i) => ({ ...s, state: stepState(i) }));

  // One deadline and one action for the "next step" card.
  const open = appStatus === "open";
  const countdown: { target: string; label: string } | null =
    (!status || status === "draft") && open
      ? { target: appDeadline, label: t.left.apply }
      : status === "accepted" && !confirmLate && confirmDeadline
        ? { target: confirmDeadline, label: t.left.confirm }
        : status === "confirmed" || (status === "checked_in" && now < Date.parse(hackStart))
          ? { target: hackStart, label: t.left.event }
          : status === "checked_in" && windowOpen
            ? { target: deadline, label: t.left.submit }
            : null;
  const cta: { href: string; label: string } | null =
    !status && open
      ? { href: "#form", label: t.go.form }
      : status === "draft" && open
        ? { href: "#form", label: t.go.draft }
        : status === "confirmed" && qrSvg
          ? { href: "#qr", label: t.go.qr }
          : status === "checked_in"
            ? team
              ? { href: "#submission", label: t.go.submit }
              : { href: "#team", label: t.go.team }
            : null;

  const qrCard = qrSvg && (
    <Card key="qr" id="qr" title={t.qr.title}>
      <p className="text-muted">{t.qr.body}</p>
      <div
        role="img"
        aria-label={t.qr.alt}
        className="w-full max-w-[280px] rounded-lg border border-rule bg-white p-3 [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
    </Card>
  );
  const teamCard = (canTeam || status === "submitted") && (
    <Card key="team" id="team" title={t.team.title}>
      <TeamCard lang={lang} userId={user.id} team={team} canTeam={canTeam} wantsMatch={Boolean(app?.wants_match)} />
    </Card>
  );
  const submissionCard = status === "checked_in" && (
    <Card key="submission" id="submission" title={t.submission.title}>
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
          {submitted ? (
            <div className="grid gap-1 rounded-lg border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-[15px]">
              <p className="font-semibold">{t.submission.received(formatDate(submission!.submitted_at as string, lang))}</p>
              <p className="text-muted">{t.submission.lastEdit(editorName, formatDate(submission!.updated_at as string, lang))}</p>
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
  );
  const formCard = showForm && (
    <Card key="form" id="form" title={status && status !== "draft" ? t.form.viewTitle : t.form.title}>
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
  );
  // What matters most comes first: the QR code before the event, the submission during it.
  const sections =
    status === "confirmed"
      ? [qrCard, teamCard, formCard]
      : status === "checked_in"
        ? [submissionCard, teamCard, qrCard, formCard]
        : [teamCard, formCard];

  return (
    <div className="wrap grid max-w-[880px] gap-8 pb-16 pt-6 md:gap-10 md:pb-20 md:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <p className="label">{t.title}</p>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere] md:text-[40px]">{t.hello(firstName)}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {staff && (
            <Link href={role === "judge" ? "/admin/juri" : "/admin"} className="btn btn-secondary min-h-11 py-2 text-[14px]">
              {t.admin}
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn btn-secondary min-h-11 py-2 text-[14px]">
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
          <section aria-labelledby="next-h" className="grid gap-6 rounded-2xl border border-rule bg-surface p-5 shadow-[0_24px_48px_-32px_rgb(23_23_23/0.25)] md:p-8">
            {(status || open) && <Stepper steps={steps} label={t.steps.label} stateLabels={t.steps.state} />}
            <div className={`grid gap-3 ${status || open ? "border-t border-dashed border-rule pt-6" : ""}`}>
              <p className="label text-accent">{status === "rejected" || status === "declined" ? t.status.label : t.nextTitle}</p>
              <h2 id="next-h" className="text-[24px] font-semibold leading-tight tracking-[-0.01em] md:text-[28px]">
                {statusTitle}
              </h2>
              <p className="max-w-[60ch]">{nextStep}</p>
              {countdown && <Countdown target={countdown.target} label={countdown.label} units={t.units} />}
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
              {cta && (
                <a href={cta.href} className="btn btn-primary mt-1 w-full sm:w-fit">
                  {cta.label}
                  <span aria-hidden="true">↓</span>
                </a>
              )}
            </div>
          </section>

          {sections}
        </>
      )}
    </div>
  );
}

function Card({ id, title, children }: { id?: string; title?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid gap-4 rounded-xl border border-rule bg-surface p-5 md:p-8">
      {title && <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>}
      {children}
    </section>
  );
}
