import { assignJudge, autoAssign, setRoundClosed } from "@/app/admin/actions";
import ActionButton from "@/components/admin/ActionButton";
import AdminShell, { Panel, td, th } from "@/components/admin/AdminShell";
import { Flag } from "@/components/admin/Badge";
import { AssignJudge, CriteriaEditor, FinalistPicker } from "@/components/admin/JudgingTools";
import { requireRole, STAFF } from "@/lib/auth";
import { parseCriteria, results, ROUND_LABELS, ROUNDS } from "@/lib/judging";

export const dynamic = "force-dynamic";

export default async function Judging() {
  const { profile, supabase } = await requireRole(STAFF, "/admin/puanlama");
  const [{ data: subs }, { data: teams }, { data: judges }, { data: assignments }, { data: scores }, { data: settings }] = await Promise.all([
    supabase.from("submissions").select("id, team_id, title, finalist, submitted_at").not("submitted_at", "is", null).order("created_at"),
    supabase.from("teams").select("id, name"),
    supabase.from("profiles").select("id, email, full_name").eq("role", "judge").is("disabled_at", null),
    supabase.from("judge_assignments").select("submission_id, judge_id"),
    supabase.from("scores").select("submission_id, judge_id, round, criteria"),
    supabase.from("settings").select("key, value").in("key", ["judging_criteria", "closed_rounds"]),
  ]);
  const st = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));
  const criteria = parseCriteria(st.judging_criteria);
  const closed: string[] = Array.isArray(st.closed_rounds) ? st.closed_rounds : [];
  const teamName = (id: string) => teams?.find((t) => t.id === id)?.name ?? "?";
  const judgeName = (id: string) => {
    const j = judges?.find((x) => x.id === id);
    return j?.full_name || j?.email || "(jüri değil)";
  };
  const fmt = (n: number | null) => (n === null ? "-" : n.toFixed(2));

  const resultFor = (round: string) => {
    const r = results(criteria, (scores ?? []).filter((s) => s.round === round) as { submission_id: string; criteria: Record<string, number> }[]);
    return (subs ?? [])
      .filter((s) => round === "finalist_selection" || s.finalist)
      .map((s) => ({ ...s, team: teamName(s.team_id), r: r.get(s.id) ?? { mean: null, judges: 0, sd: null } }))
      .sort((a, b) => (b.r.mean ?? -1) - (a.r.mean ?? -1));
  };
  const selection = resultFor("finalist_selection");
  const final = resultFor("final");
  const weightSum = criteria.reduce((a, c) => a + c.weight, 0);

  return (
    <AdminShell profile={profile} current="/admin/puanlama" title="Jüri ve puanlama">
      <Panel title="Turlar">
        <div className="grid gap-3 sm:grid-cols-2">
          {ROUNDS.map((r) => (
            <div key={r} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rule p-3">
              <span className="font-medium">
                {ROUND_LABELS[r]} {closed.includes(r) ? <Flag tone="muted">Kapalı, puanlar kilitli</Flag> : <Flag tone="muted">Açık</Flag>}
              </span>
              <ActionButton
                label={closed.includes(r) ? "Turu yeniden aç" : "Turu kapat"}
                confirm={closed.includes(r) ? "Jüriler yeniden puan değiştirebilecek. Emin misin?" : "Tur kapanınca jüriler puan giremez ve değiştiremez. Emin misin?"}
                action={setRoundClosed.bind(null, r, !closed.includes(r))}
              />
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted">
          Finalist seçimi: atanan jüriler masalarda puanlar. Final: finalist olarak işaretlenen takımları bütün jüriler görür ve puanlar.
        </p>
      </Panel>

      <Panel title="Ölçütler">
        <p className="text-[13px] text-muted">
          Önerilen ölçütler organizatör onayı bekliyor. Her ölçüt 1-10 puanlanır; sonuç ağırlıklı ortalamadır. Ağırlık toplamı şu an {weightSum}.
        </p>
        <CriteriaEditor initial={criteria} />
      </Panel>

      <Panel title={`Finalist seçimi atamaları (${subs?.length ?? 0} teslim, ${judges?.length ?? 0} jüri)`}>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton label="Eksikleri otomatik ata (her takıma 2 jüri)" action={autoAssign.bind(null, 2)} success={(r) => `${r.count} atama eklendi.`} />
          {(judges?.length ?? 0) < 2 && <Flag>En az 2 jüri hesabı gerekli</Flag>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className={th}>Takım / proje</th>
                <th className={th}>Atanan jüriler</th>
                <th className={th}>Ekle</th>
              </tr>
            </thead>
            <tbody>
              {(subs ?? []).map((s) => {
                const list = (assignments ?? []).filter((a) => a.submission_id === s.id);
                return (
                  <tr key={s.id}>
                    <td className={td}>
                      <strong>{teamName(s.team_id)}</strong>
                      <div className="text-muted">{s.title}</div>
                      {list.length < 2 && <Flag>2 jüriden az</Flag>}
                    </td>
                    <td className={td}>
                      <ul className="grid gap-1">
                        {list.map((a) => (
                          <li key={a.judge_id} className="flex flex-wrap items-center gap-2">
                            {judgeName(a.judge_id)}
                            <ActionButton label="Kaldır" action={assignJudge.bind(null, s.id, a.judge_id, false)} />
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className={td}>
                      <AssignJudge submissionId={s.id} judges={(judges ?? []).filter((j) => !list.some((a) => a.judge_id === j.id)).map((j) => ({ id: j.id, label: j.full_name || j.email }))} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Sonuçlar: finalist seçimi">
        <p className="text-[13px] text-muted">İlk 10 önerilir. Eşitlikte karar senin. Seçimi kaydedince final turunda bu takımlar jürilere açılır.</p>
        <FinalistPicker
          rows={selection.map((s) => ({ id: s.id, team: s.team, title: s.title, mean: fmt(s.r.mean), judges: s.r.judges, sd: fmt(s.r.sd), finalist: s.finalist }))}
        />
      </Panel>

      <Panel title="Sonuçlar: final">
        {final.length === 0 ? (
          <p className="text-muted">Henüz finalist yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Sıra</th>
                  <th className={th}>Takım / proje</th>
                  <th className={`${th} text-right`}>Ağırlıklı ort.</th>
                  <th className={`${th} text-right`}>Jüri</th>
                  <th className={`${th} text-right`}>Std. sapma</th>
                </tr>
              </thead>
              <tbody>
                {final.map((s, i) => (
                  <tr key={s.id}>
                    <td className={`${td} font-mono`}>{i + 1}</td>
                    <td className={td}>
                      <strong>{s.team}</strong> <span className="text-muted">· {s.title}</span>
                    </td>
                    <td className={`${td} text-right font-mono`}>{fmt(s.r.mean)}</td>
                    <td className={`${td} text-right font-mono`}>{s.r.judges}</td>
                    <td className={`${td} text-right font-mono`}>{fmt(s.r.sd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}
