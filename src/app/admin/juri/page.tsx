import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { Flag } from "@/components/admin/Badge";
import ScoreForm from "@/components/admin/ScoreForm";
import { JURY, requireRole } from "@/lib/auth";
import { parseCriteria, ROUND_LABELS, type Round } from "@/lib/judging";

export const dynamic = "force-dynamic";

/** Jury screen. Judges only see what RLS lets them: their assigned submissions, or the finalists. No personal data. */
export default async function Jury({ searchParams }: { searchParams: Promise<{ tur?: string }> }) {
  const { profile, supabase } = await requireRole(JURY, "/admin/juri");
  const round: Round = (await searchParams).tur === "final" ? "final" : "finalist_selection";
  const isJudge = profile.role === "judge";

  const [{ data: settings }, { data: myAssignments }] = await Promise.all([
    supabase.from("settings").select("key, value").in("key", ["judging_criteria", "closed_rounds"]),
    supabase.from("judge_assignments").select("submission_id").eq("judge_id", profile.id),
  ]);
  const st = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));
  const criteria = parseCriteria(st.judging_criteria);
  const closed = Array.isArray(st.closed_rounds) && st.closed_rounds.includes(round);

  let q = supabase
    .from("submissions")
    .select("id, team_id, title, problem, description, repo_url, demo_url, demo_is_local, slides_url, ai_tools, finalist")
    .not("submitted_at", "is", null)
    .order("created_at");
  if (round === "final") q = q.eq("finalist", true);
  else if (isJudge || myAssignments?.length) q = q.in("id", (myAssignments ?? []).map((a) => a.submission_id));
  const { data: subs } = await q;

  const [{ data: teams }, { data: mine }] = await Promise.all([
    supabase.from("teams").select("id, name").in("id", (subs ?? []).map((s) => s.team_id)),
    supabase.from("scores").select("submission_id, criteria, comment").eq("judge_id", profile.id).eq("round", round),
  ]);

  return (
    <AdminShell profile={profile} current="/admin/juri" title="Jüri ekranı">
      <nav aria-label="Turlar" className="flex flex-wrap gap-2">
        {(["finalist_selection", "final"] as const).map((r) => (
          <Link key={r} href={r === "final" ? "/admin/juri?tur=final" : "/admin/juri"} aria-current={r === round ? "page" : undefined} className={`btn ${r === round ? "btn-primary" : "btn-secondary"}`}>
            {ROUND_LABELS[r]}
          </Link>
        ))}
      </nav>
      <p className="text-[14px] text-muted">
        {round === "finalist_selection" ? "Sana atanan takımlar. Masada demoyu izledikten sonra puanla." : "Finalist takımlar. Sahnedeki sunumdan sonra puanla."} Her ölçüt 1 (zayıf) ile 10 (çok iyi) arası.
        {closed && " Bu tur kapandı; puanlar kilitli."}
      </p>
      {!isJudge && !myAssignments?.length && round === "finalist_selection" && (
        <p className="text-[14px] text-muted">Admin olarak tüm teslimleri görüyorsun. Puan girersen senin adına kaydedilir.</p>
      )}
      {(subs ?? []).length === 0 && <p className="rounded-xl border border-rule bg-surface p-6 text-muted">Bu turda sana gösterilecek proje yok.</p>}

      <ul className="grid gap-4">
        {(subs ?? []).map((s) => {
          const score = mine?.find((m) => m.submission_id === s.id);
          return (
            <li key={s.id} className="grid gap-4 rounded-xl border border-rule bg-surface p-4 md:grid-cols-[1.2fr_1fr] md:p-6">
              <article className="grid content-start gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-semibold">{s.title}</h2>
                  {score && <Flag tone="muted">Puanlandı</Flag>}
                </div>
                <p className="text-[14px] text-muted">Takım: {teams?.find((t) => t.id === s.team_id)?.name}</p>
                <div className="grid gap-1">
                  <h3 className="label">Problem</h3>
                  <p className="whitespace-pre-wrap text-[15px]">{s.problem}</p>
                </div>
                <div className="grid gap-1">
                  <h3 className="label">Açıklama</h3>
                  <p className="whitespace-pre-wrap text-[15px]">{s.description}</p>
                </div>
                <div className="grid gap-1">
                  <h3 className="label">AI araçları</h3>
                  <p className="whitespace-pre-wrap text-[15px]">{s.ai_tools}</p>
                </div>
                <ul className="flex flex-wrap gap-x-4 text-[15px]">
                  {s.repo_url && (
                    <li>
                      <a href={s.repo_url} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                        Repo
                      </a>
                    </li>
                  )}
                  {s.demo_url && (
                    <li>
                      <a href={s.demo_url} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                        Canlı demo
                      </a>
                    </li>
                  )}
                  {s.demo_is_local && <li className="inline-flex min-h-11 items-center text-muted">Demo yerelde çalışıyor</li>}
                  {s.slides_url && (
                    <li>
                      <a href={s.slides_url} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                        Sunum
                      </a>
                    </li>
                  )}
                </ul>
              </article>
              <ScoreForm
                submissionId={s.id}
                round={round}
                criteria={criteria}
                initial={(score?.criteria ?? {}) as Record<string, number>}
                initialComment={score?.comment ?? ""}
                locked={closed}
              />
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
