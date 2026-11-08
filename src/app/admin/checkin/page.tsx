import AdminShell, { Panel } from "@/components/admin/AdminShell";
import CheckinScanner from "@/components/admin/CheckinScanner";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Checkin() {
  const { profile, supabase } = await requireRole(STAFF, "/admin/checkin");
  const [{ data: recent }, { count: done }, { count: expected }] = await Promise.all([
    supabase.from("applications").select("id, answers, checked_in_at").eq("status", "checked_in").order("checked_in_at", { ascending: false }).limit(15),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
    supabase.from("applications").select("id", { count: "exact", head: true }).in("status", ["confirmed", "checked_in"]),
  ]);

  return (
    <AdminShell profile={profile} current="/admin/checkin" title="Check-in">
      <p className="font-mono text-[20px]" aria-live="polite">
        {done ?? 0} / {expected ?? 0} <span className="font-sans text-[14px] text-muted">onaylayan kişi giriş yaptı</span>
      </p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
        <CheckinScanner />
        <Panel title="Son check-in'ler">
          {(recent ?? []).length === 0 ? (
            <p className="text-muted">Henüz kimse girmedi.</p>
          ) : (
            <ol className="grid gap-2">
              {(recent ?? []).map((r) => {
                const a = (r.answers ?? {}) as Record<string, string>;
                return (
                  <li key={r.id} className="flex justify-between gap-3 border-t border-rule pt-2 text-[14px]">
                    <span>
                      {a.first_name} {a.last_name} <span className="text-muted">· {a.university}</span>
                    </span>
                    <span className="font-mono text-[12px] text-muted">
                      {r.checked_in_at && new Date(r.checked_in_at).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
