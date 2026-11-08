import { adminRemoveMember, setTeamLock } from "@/app/admin/actions";
import ActionButton from "@/components/admin/ActionButton";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import { Flag, StatusBadge } from "@/components/admin/Badge";
import { AddToTeam, CreateTeam } from "@/components/admin/TeamTools";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Teams() {
  const { profile, supabase } = await requireRole(STAFF, "/admin/takimlar");
  const [{ data: teams }, { data: members }, { data: apps }, { data: subs }, { data: lockSetting }] = await Promise.all([
    supabase.from("teams").select("id, name, join_code, locked_at, created_at").order("created_at"),
    supabase.from("team_members").select("team_id, user_id"),
    supabase.from("applications").select("user_id, status, answers, wants_match").in("status", ["accepted", "confirmed", "checked_in"]),
    supabase.from("submissions").select("team_id, submitted_at"),
    supabase.from("settings").select("value").eq("key", "teams_lock_at").maybeSingle(),
  ]);
  const person = (uid: string) => {
    const a = apps?.find((x) => x.user_id === uid);
    const x = (a?.answers ?? {}) as Record<string, string>;
    return { name: `${x.first_name ?? ""} ${x.last_name ?? ""}`.trim() || "(başvurusu kabul edilmemiş kişi)", uni: x.university ?? "", status: a?.status ?? "" };
  };
  const inTeam = new Set((members ?? []).map((m) => m.user_id));
  const teamless = (apps ?? [])
    .filter((a) => !inTeam.has(a.user_id))
    .map((a) => ({ id: a.user_id, ...person(a.user_id), looking: a.wants_match || (a.answers as Record<string, string>)?.team_status === "looking" }))
    .sort((a, b) => Number(b.looking) - Number(a.looking));
  const teamOptions = (teams ?? []).map((t) => ({ id: t.id, label: `${t.name} (${(members ?? []).filter((m) => m.team_id === t.id).length}/5)` }));
  const globalLock = typeof lockSetting?.value === "string" ? lockSetting.value : null;

  return (
    <AdminShell
      profile={profile}
      current="/admin/takimlar"
      title="Takımlar"
      actions={
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Tüm takımları kilitle" confirm="Tüm takımlar kilitlenecek; katılımcılar katılamaz ve ayrılamaz. Emin misin?" action={setTeamLock.bind(null, "all", true)} success="Kilitlendi." />
          <ActionButton label="Tüm kilitleri aç" confirm="Tüm takım kilitleri açılacak. Emin misin?" action={setTeamLock.bind(null, "all", false)} success="Kilitler açıldı." />
        </div>
      }
    >
      <p className="text-[14px] text-muted">
        {teams?.length ?? 0} takım · {teamless.length} kabul edilmiş kişi takımsız.{" "}
        {globalLock ? `Otomatik kilit zamanı: ${new Date(globalLock).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}.` : "Otomatik kilit zamanı belirlenmedi (İçerik)."}
      </p>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="grid content-start gap-4">
          {(teams ?? []).length === 0 && <p className="text-muted">Henüz takım yok.</p>}
          {(teams ?? []).map((t) => {
            const list = (members ?? []).filter((m) => m.team_id === t.id);
            const sub = subs?.find((s) => s.team_id === t.id);
            return (
              <Panel key={t.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-semibold">{t.name}</h2>
                    <code className="font-mono text-[13px] text-muted">{t.join_code}</code>
                    <span className="font-mono text-[13px]">{list.length}/5</span>
                    {list.length < 3 && <Flag>3 kişiden az</Flag>}
                    {list.length > 5 && <Flag>5 kişiden fazla</Flag>}
                    {t.locked_at && <Flag tone="muted">Kilitli</Flag>}
                    {sub?.submitted_at && <Flag tone="muted">Teslim etti</Flag>}
                  </div>
                  <ActionButton
                    label={t.locked_at ? "Kilidi aç" : "Kilitle"}
                    action={setTeamLock.bind(null, t.id, !t.locked_at)}
                  />
                </div>
                <ul className="grid gap-2">
                  {list.map((m) => {
                    const p = person(m.user_id);
                    return (
                      <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-2 text-[14px]">
                        <span>
                          {p.name} <span className="text-muted">· {p.uni}</span> {p.status && <StatusBadge status={p.status} />}
                        </span>
                        <ActionButton label="Çıkar" confirm={`${p.name} takımdan çıkarılsın mı?`} action={adminRemoveMember.bind(null, t.id, m.user_id)} />
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            );
          })}
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Eşleştirme için yeni takım">
            <CreateTeam />
          </Panel>
          <Panel title={`Takımsız kabul edilenler (${teamless.length})`}>
            <p className="text-[13px] text-muted">Takım arayanlar üstte. Bir kişiyi takıma eklemek için takım seç.</p>
            <ul className="grid gap-3">
              {teamless.map((p) => (
                <li key={p.id} className="grid gap-2 border-t border-rule pt-3 text-[14px]">
                  <span>
                    {p.name} <span className="text-muted">· {p.uni}</span> {p.looking && <Flag>Takım arıyor</Flag>} <StatusBadge status={p.status} />
                  </span>
                  <AddToTeam userId={p.id} teams={teamOptions} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
