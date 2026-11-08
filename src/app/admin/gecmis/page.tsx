import AdminShell, { td, th } from "@/components/admin/AdminShell";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  role_change: "Rol değişikliği",
  application_status: "Başvuru durumu",
  invite: "Davet",
  account_disable: "Hesap devre dışı",
  account_enable: "Hesap etkin",
  settings_update: "Ayarlar",
  sponsor_save: "Sponsor kaydı",
  sponsor_delete: "Sponsor silme",
  person_save: "Jüri/mentor kaydı",
  person_delete: "Jüri/mentor silme",
  team_create: "Takım kuruldu",
  team_add_member: "Takıma eklendi",
  team_remove_member: "Takımdan çıkarıldı",
  team_lock: "Takım kilidi",
  team_unlock: "Takım kilidi açıldı",
  judges_auto_assign: "Jüri ataması",
  finalists_set: "Finalistler",
  round_close: "Tur kapandı",
  round_open: "Tur açıldı",
  criteria_update: "Ölçütler",
  bulk_email: "Toplu e-posta",
};

export default async function History({ searchParams }: { searchParams: Promise<{ tur?: string }> }) {
  const { profile, supabase } = await requireRole(STAFF, "/admin/gecmis");
  const sp = await searchParams;
  let q = supabase.from("audit_log").select("id, actor_id, action, target_type, target_id, details, created_at").order("created_at", { ascending: false }).limit(300);
  if (sp.tur) q = q.eq("action", sp.tur);
  const [{ data: rows }, { data: people }] = await Promise.all([q, supabase.from("profiles").select("id, email")]);
  const who = (id: string | null) => (id ? people?.find((p) => p.id === id)?.email ?? id.slice(0, 8) : "sistem");

  return (
    <AdminShell profile={profile} current="/admin/gecmis" title="İşlem geçmişi">
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[13px]">
          İşlem türü
          <select name="tur" defaultValue={sp.tur ?? ""} className="min-h-11 rounded-lg border border-rule bg-surface px-3">
            <option value="">Hepsi</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filtrele
        </button>
      </form>
      <p className="text-[13px] text-muted">Son 300 kayıt. Kayıtlar silinemez ve değiştirilemez.</p>
      <div className="overflow-x-auto rounded-xl border border-rule bg-surface">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              <th className={th}>Zaman</th>
              <th className={th}>Kim</th>
              <th className={th}>İşlem</th>
              <th className={th}>Hedef</th>
              <th className={th}>Ayrıntı</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const d = r.details as Record<string, unknown>;
              const target = r.target_type === "profile" ? who(r.target_id) : r.target_id ? `${r.target_type} ${String(r.target_id).slice(0, 8)}` : "";
              return (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap font-mono text-[12px]`}>
                    {new Date(r.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "medium" })}
                  </td>
                  <td className={td}>{who(r.actor_id)}</td>
                  <td className={td}>{ACTION_LABEL[r.action] ?? r.action}</td>
                  <td className={td}>{target}</td>
                  <td className={`${td} max-w-[420px] font-mono text-[12px] [overflow-wrap:anywhere]`}>
                    {d.from || d.to ? `${String(d.from)} → ${String(d.to)}` : JSON.stringify(d).slice(0, 200)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
