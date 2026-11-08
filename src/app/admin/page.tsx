import AdminShell, { Panel, td, th } from "@/components/admin/AdminShell";
import { LEVEL_LABEL, STATUS_LABEL } from "@/components/admin/labels";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const { profile, supabase } = await requireRole(STAFF, "/admin");
  const [{ data: apps }, { count: teams }, { count: subs }] = await Promise.all([
    supabase.from("applications").select("status, answers, is_minor, wants_match"),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }).not("submitted_at", "is", null),
  ]);
  const list = (apps ?? []).filter((a) => a.status !== "draft");
  const by = (s: string) => list.filter((a) => a.status === s).length;
  const answer = (a: { answers: unknown }, k: string) => ((a.answers ?? {}) as Record<string, string>)[k] ?? "";
  const lookingCount = list.filter((a) => answer(a, "team_status") === "looking" || a.wants_match).length;

  const stats: [string, number, string?][] = [
    ["Toplam başvuru", list.length, "Gönderilmiş (taslaklar hariç)"],
    ["İnceleniyor", by("submitted")],
    ["Kabul (onay bekliyor)", by("accepted")],
    ["Onaylayan", by("confirmed") + by("checked_in"), "Check-in yapanlar dahil"],
    ["Yedek", by("waitlisted")],
    ["Ret", by("rejected")],
    ["Katılmıyor", by("declined")],
    ["Check-in", by("checked_in")],
    ["Takım", teams ?? 0],
    ["Takım arayan", lookingCount],
    ["Teslim", subs ?? 0],
    ["18 yaş altı", list.filter((a) => a.is_minor).length, "Karar bekleyen konu, notlara bak"],
  ];

  const group = (key: string, labels?: Record<string, string>) => {
    const m = new Map<string, number>();
    for (const a of list) {
      const v = answer(a, key).trim() || "(boş)";
      const label = labels?.[v] ?? v;
      m.set(label, (m.get(label) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  return (
    <AdminShell profile={profile} current="/admin" title="Genel bakış">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([label, n, hint]) => (
          <li key={label} className="grid gap-1 rounded-xl border border-rule bg-surface p-4">
            <span className="text-[13px] text-muted">{label}</span>
            <span className="font-mono text-[28px] font-medium">{n}</span>
            {hint && <span className="text-[12px] text-muted">{hint}</span>}
          </li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Üniversiteye göre">
          <Dist rows={group("university")} />
        </Panel>
        <Panel title="Öğrenim düzeyine göre">
          <Dist rows={group("level", LEVEL_LABEL)} />
        </Panel>
      </div>
    </AdminShell>
  );
}

function Dist({ rows }: { rows: [string, number][] }) {
  if (!rows.length) return <p className="text-muted">Henüz başvuru yok.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={th}>Değer</th>
            <th className={`${th} text-right`}>Sayı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, n]) => (
            <tr key={k}>
              <td className={td}>{k}</td>
              <td className={`${td} text-right font-mono`}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
