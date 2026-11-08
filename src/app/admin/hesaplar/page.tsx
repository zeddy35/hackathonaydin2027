import { setDisabled } from "@/app/admin/actions";
import ActionButton from "@/components/admin/ActionButton";
import AdminShell, { Panel, td, th } from "@/components/admin/AdminShell";
import { Flag } from "@/components/admin/Badge";
import { InviteForm, RoleSelect } from "@/components/admin/AccountTools";
import { ROLE_LABEL } from "@/components/admin/labels";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Accounts({ searchParams }: { searchParams: Promise<{ q?: string; rol?: string }> }) {
  const { profile, supabase } = await requireRole(STAFF, "/admin/hesaplar");
  const sp = await searchParams;
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, disabled_at, created_at").order("created_at");
  const q = (sp.q ?? "").toLocaleLowerCase("tr").trim();
  const order = { owner: 0, admin: 1, judge: 2, participant: 3 } as Record<string, number>;
  const rows = (data ?? [])
    .filter((p) => (!q || `${p.email} ${p.full_name ?? ""}`.toLocaleLowerCase("tr").includes(q)) && (!sp.rol || p.role === sp.rol))
    .sort((a, b) => order[a.role] - order[b.role]);
  const isOwner = profile.role === "owner";

  return (
    <AdminShell profile={profile} current="/admin/hesaplar" title="Hesaplar">
      <Panel title="Admin veya jüri ekle">
        <InviteForm />
        <p className="text-[13px] text-muted">
          Kayıtlı kişiye rol hemen verilir. Kayıtlı değilse davet e-postası (giriş linki) gider; bunun için sunucuda SUPABASE_SERVICE_ROLE_KEY gerekli. Owner atamak için önce kişiyi admin yap; sonra sadece bir owner onu owner yapabilir.
        </p>
      </Panel>
      <form method="get" role="search" className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[13px]">
          Ara
          <input name="q" defaultValue={sp.q} className="min-h-11 rounded-lg border border-rule bg-surface px-3" />
        </label>
        <label className="grid gap-1 text-[13px]">
          Rol
          <select name="rol" defaultValue={sp.rol ?? ""} className="min-h-11 rounded-lg border border-rule bg-surface px-3">
            <option value="">Hepsi</option>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
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
      <div className="overflow-x-auto rounded-xl border border-rule bg-surface">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th className={th}>Kişi</th>
              <th className={th}>Rol</th>
              <th className={th}>Durum</th>
              <th className={th}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const self = p.id === profile.id;
              const lockedOwner = p.role === "owner" && !isOwner;
              return (
                <tr key={p.id}>
                  <td className={td}>
                    <span className="font-medium">{p.full_name || "(isimsiz)"}</span>
                    {self && <span className="ml-2 text-muted">(sen)</span>}
                    <div className="text-[12px] text-muted">{p.email}</div>
                  </td>
                  <td className={td}>
                    {self || lockedOwner ? ROLE_LABEL[p.role] : <RoleSelect userId={p.id} role={p.role} canOwner={isOwner} />}
                  </td>
                  <td className={td}>{p.disabled_at ? <Flag>Devre dışı</Flag> : <span className="text-muted">Aktif</span>}</td>
                  <td className={td}>
                    {!self && p.role !== "owner" && (
                      <ActionButton
                        label={p.disabled_at ? "Etkinleştir" : "Devre dışı bırak"}
                        confirm={p.disabled_at ? undefined : `${p.email} hesabı devre dışı bırakılsın mı? Panel ve yönetim ekranlarına giremez.`}
                        action={setDisabled.bind(null, p.id, !p.disabled_at)}
                        success={(r) => (r.message === "banned" ? "Kaydedildi; giriş de engellendi." : "Kaydedildi. Giriş engeli için sunucuda service role anahtarı gerekli; uygulama erişimi kapalı.")}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-muted">Owner hesabı silinemez ve devre dışı bırakılamaz; son owner'ın rolü kaldırılamaz. Kimse kendi rolünü değiştiremez. Tüm rol değişiklikleri İşlem geçmişi'ne yazılır.</p>
    </AdminShell>
  );
}
