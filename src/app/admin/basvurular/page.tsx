import Link from "next/link";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import ApplicationsTable, { type AppRow } from "@/components/admin/ApplicationsTable";
import { LEVEL_LABEL, STATUS_LABEL, TEAM_STATUS_LABEL } from "@/components/admin/labels";
import { requireRole, STAFF } from "@/lib/auth";
import { DEFAULT_COLUMNS, EXPORT_COLUMNS } from "@/lib/export";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
type SP = { q?: string; status?: string; uni?: string; team?: string; level?: string; minor?: string; sort?: string; page?: string };

export default async function Applications({ searchParams }: { searchParams: Promise<SP> }) {
  const { profile, supabase } = await requireRole(STAFF, "/admin/basvurular");
  const sp = await searchParams;

  const [{ data: apps }, { data: profiles }, { data: settings }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, user_id, status, answers, submitted_at, is_minor, wants_match")
      .neq("status", "draft"),
    supabase.from("profiles").select("id, email"),
    supabase.from("settings").select("key, value").in("key", ["confirm_deadline", "mlh_enabled"]),
  ]);
  const st = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));

  const all: AppRow[] = (apps ?? []).map((a) => {
    const x = (a.answers ?? {}) as Record<string, unknown>;
    const s = (k: string) => (typeof x[k] === "string" ? (x[k] as string) : "");
    return {
      id: a.id,
      name: `${s("first_name")} ${s("last_name")}`.trim() || "(isimsiz)",
      email: profiles?.find((p) => p.id === a.user_id)?.email ?? "",
      university: s("university"),
      department: s("department"),
      level: s("level"),
      teamStatus: a.wants_match ? "looking" : s("team_status"),
      roles: Array.isArray(x.roles) ? (x.roles as string[]) : [],
      submittedAt: a.submitted_at,
      status: a.status,
      minor: a.is_minor,
    };
  });

  const universities = [...new Set(all.map((r) => r.university).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
  const q = (sp.q ?? "").trim().toLocaleLowerCase("tr");
  let rows = all.filter(
    (r) =>
      (!q || `${r.name} ${r.email} ${r.university} ${r.department}`.toLocaleLowerCase("tr").includes(q)) &&
      (!sp.status || r.status === sp.status) &&
      (!sp.uni || r.university === sp.uni) &&
      (!sp.team || r.teamStatus === sp.team) &&
      (!sp.level || r.level === sp.level) &&
      (!sp.minor || r.minor)
  );
  const sort = sp.sort ?? "new";
  rows = rows.sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name, "tr")
      : sort === "uni"
        ? a.university.localeCompare(b.university, "tr")
        : sort === "old"
          ? (a.submittedAt ?? "").localeCompare(b.submittedAt ?? "")
          : (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const link = (p: number) => {
    const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    u.set("page", String(p));
    return `/admin/basvurular?${u}`;
  };
  const select = "min-h-11 rounded-lg border border-rule bg-surface px-3 text-[14px]";

  return (
    <AdminShell profile={profile} current="/admin/basvurular" title="Başvurular">
      <form method="get" className="grid gap-3 rounded-xl border border-rule bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_repeat(5,1fr)_auto]" role="search">
        <label className="grid gap-1 text-[13px]">
          Ara (ad, e-posta, üniversite)
          <input name="q" defaultValue={sp.q} className={select} />
        </label>
        <label className="grid gap-1 text-[13px]">
          Durum
          <select name="status" defaultValue={sp.status ?? ""} className={select}>
            <option value="">Hepsi</option>
            {Object.entries(STATUS_LABEL)
              .filter(([k]) => k !== "draft")
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px]">
          Üniversite
          <select name="uni" defaultValue={sp.uni ?? ""} className={select}>
            <option value="">Hepsi</option>
            {universities.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px]">
          Takım durumu
          <select name="team" defaultValue={sp.team ?? ""} className={select}>
            <option value="">Hepsi</option>
            {Object.entries(TEAM_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px]">
          Düzey
          <select name="level" defaultValue={sp.level ?? ""} className={select}>
            <option value="">Hepsi</option>
            {Object.entries(LEVEL_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[13px]">
          Sıralama
          <select name="sort" defaultValue={sort} className={select}>
            <option value="new">Yeni başvuru önce</option>
            <option value="old">Eski başvuru önce</option>
            <option value="name">Ada göre</option>
            <option value="uni">Üniversiteye göre</option>
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-h-11 items-center gap-2 text-[13px]">
            <input type="checkbox" name="minor" value="1" defaultChecked={!!sp.minor} className="h-4 w-4" />
            18 yaş altı
          </label>
          <button type="submit" className="btn btn-primary">
            Filtrele
          </button>
          <Link href="/admin/basvurular" className="link inline-flex min-h-11 items-center text-[14px]">
            Temizle
          </Link>
        </div>
      </form>

      <p className="text-[14px] text-muted">
        {rows.length} sonuç · sayfa {page}/{pages}. Kabul e-postasındaki onay son tarihi:{" "}
        <strong className="text-ink">
          {typeof st.confirm_deadline === "string"
            ? new Date(st.confirm_deadline).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
            : "belirlenmedi"}
        </strong>{" "}
        (<Link href="/admin/icerik" className="link">İçerik</Link> sayfasından değiştir).
      </p>

      <ApplicationsTable rows={shown} />

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="flex flex-wrap gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={link(p)} aria-current={p === page ? "page" : undefined} className={`btn ${p === page ? "btn-primary" : "btn-secondary"} min-w-11`}>
              {p}
            </Link>
          ))}
        </nav>
      )}

      <Panel title="CSV dışa aktarma">
        <form method="get" action="/admin/export" className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-[14px] font-medium">Sütunlar</legend>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
              {EXPORT_COLUMNS.map((c) => (
                <label key={c.key} className="flex min-h-11 items-center gap-2 text-[14px]">
                  <input type="checkbox" name="cols" value={c.key} defaultChecked={DEFAULT_COLUMNS.includes(c.key)} className="h-4 w-4" />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid max-w-xs gap-1 text-[13px]">
            Durum (boş: hepsi)
            <select name="status" className={select} defaultValue="">
              <option value="">Hepsi</option>
              {Object.entries(STATUS_LABEL)
                .filter(([k]) => k !== "draft")
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">
              CSV indir
            </button>
            <a href="/admin/export?preset=marketing" className="btn btn-secondary">
              Duyuru izni verenler
            </a>
            {st.mlh_enabled === true && (
              <a href="/admin/export?preset=mlh" className="btn btn-secondary">
                MLH dışa aktarma (sadece MLH onayı verenler)
              </a>
            )}
          </div>
          <p className="text-[13px] text-muted">CSV kişisel veri içerir. Paylaşma, işin bitince sil.</p>
        </form>
      </Panel>
    </AdminShell>
  );
}
