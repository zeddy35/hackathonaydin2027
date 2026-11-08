import Link from "next/link";
import { notFound } from "next/navigation";
import { addNote, decideApplications } from "@/app/admin/actions";
import ActionButton from "@/components/admin/ActionButton";
import AdminShell, { Panel } from "@/components/admin/AdminShell";
import { Flag, StatusBadge } from "@/components/admin/Badge";
import { LEVEL_LABEL, ROLE_INTEREST_LABEL, TEAM_STATUS_LABEL } from "@/components/admin/labels";
import NoteForm from "@/components/admin/NoteForm";
import { panelDict } from "@/content/panel";
import { CONSENTS } from "@/lib/application";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" }) : "";

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { profile, supabase } = await requireRole(STAFF, `/admin/basvurular/${id}`);

  const { data: app } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  if (!app) notFound();
  const [{ data: person }, { data: notes }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("email, full_name, locale, created_at").eq("id", app.user_id).maybeSingle(),
    supabase.from("application_notes").select("id, body, created_at, author_id").eq("application_id", id).order("created_at"),
    supabase.from("team_members").select("teams(name, join_code)").eq("user_id", app.user_id).maybeSingle(),
  ]);
  const authors = notes?.length
    ? (await supabase.from("profiles").select("id, email").in("id", notes.map((n) => n.author_id).filter(Boolean))).data
    : [];

  const a = (app.answers ?? {}) as Record<string, unknown>;
  const s = (k: string) => (Array.isArray(a[k]) ? (a[k] as string[]).join(", ") : typeof a[k] === "string" ? (a[k] as string) : "");
  const consents = (app.consents ?? {}) as Record<string, { accepted?: boolean; at?: string }>;
  const cv = s("cv_path") ? (await supabase.storage.from("cvs").createSignedUrl(s("cv_path"), 300)).data?.signedUrl : null;
  const team = membership?.teams as unknown as { name: string; join_code: string } | null;
  const consentText = panelDict.tr.form.consents;

  const rows: [string, React.ReactNode][] = [
    ["Ad soyad", `${s("first_name")} ${s("last_name")}`],
    ["E-posta", person?.email],
    ["Telefon", s("phone")],
    ["Yaş", <>{s("age")} {app.is_minor && <Flag>18 yaş altı</Flag>}</>],
    ["Üniversite", s("university")],
    ["Bölüm", s("department")],
    ["Düzey", LEVEL_LABEL[s("level")] ?? s("level")],
    ["Mezuniyet yılı", s("grad_year")],
    ["Ülke / şehir", `${s("country")} / ${s("city")}`],
    ["Takım durumu", `${TEAM_STATUS_LABEL[s("team_status")] ?? ""}${app.wants_match ? " · eşleştirme istiyor" : ""}`],
    ["Takım", team ? `${team.name} (${team.join_code})` : "Yok"],
    ["Roller", (a.roles as string[] | undefined)?.map((r) => ROLE_INTEREST_LABEL[r] ?? r).join(", ")],
    ["Deneyim", s("experience")],
    ["Önceki hackathon", s("prior_hackathon")],
    ["Motivasyon", <span key="m" className="whitespace-pre-wrap">{s("motivation")}</span>],
    ["Tişört", s("tshirt")],
    ["Beslenme / alerji", s("diet")],
    ["Acil durum kişisi", `${s("emergency_name")} · ${s("emergency_phone")}`],
    ["GitHub", s("github")],
    ["LinkedIn", s("linkedin")],
    ["Portfolyo", s("portfolio")],
    ["CV", cv ? <a key="cv" href={cv} target="_blank" rel="noopener noreferrer" className="link">CV'yi aç (link 5 dakika geçerli)</a> : "Yok"],
    ["Dil", person?.locale],
  ];

  return (
    <AdminShell
      profile={profile}
      current="/admin/basvurular"
      title={`${s("first_name")} ${s("last_name")}`.trim() || "Başvuru"}
      actions={
        <Link href="/admin/basvurular" className="link inline-flex min-h-11 items-center text-[14px]">
          Listeye dön
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={app.status} />
        <span className="text-[14px] text-muted">
          Başvuru: {fmt(app.submitted_at)}
          {app.decided_at && ` · Karar: ${fmt(app.decided_at)}`}
          {app.checked_in_at && ` · Check-in: ${fmt(app.checked_in_at)}`}
        </span>
      </div>

      {["submitted", "accepted", "waitlisted", "rejected"].includes(app.status) && (
        <div className="flex flex-wrap items-start gap-3">
          {(
            [
              ["accepted", "Kabul et"],
              ["waitlisted", "Yedeğe al"],
              ["rejected", "Reddet"],
            ] as const
          )
            .filter(([st]) => st !== app.status)
            .map(([st, label]) => (
              <ActionButton
                key={st}
                label={label}
                confirm={`${label}: karar kaydedilecek ve kişiye karar e-postası gidecek. Emin misin?`}
                action={decideApplications.bind(null, [app.id], st, true)}
                success={(r) => (r.emailSkipped ? "Kaydedildi. E-posta yapılandırılmadığı için gönderilmedi." : "Kaydedildi.")}
              />
            ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title="Cevaplar">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[180px_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-[13px] text-muted">{k}</dt>
                <dd className="text-[14px] [overflow-wrap:anywhere]">{v || <span className="text-muted">boş</span>}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Onaylar">
            <ul className="grid gap-3">
              {CONSENTS.filter((k) => consents[k]).map((k) => (
                <li key={k} className="grid gap-1 text-[14px]">
                  <span className="font-medium">{consents[k]?.accepted ? "Evet" : "Hayır"} · {k}</span>
                  <span className="text-muted">{consentText[k].text}</span>
                  <span className="font-mono text-[12px] text-muted">{fmt(consents[k]?.at)}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Notlar (sadece adminler görür)">
            <ul className="grid gap-3">
              {(notes ?? []).map((n) => (
                <li key={n.id} className="grid gap-1 rounded-lg border border-rule p-3 text-[14px]">
                  <span className="whitespace-pre-wrap">{n.body}</span>
                  <span className="text-[12px] text-muted">
                    {authors?.find((x) => x.id === n.author_id)?.email ?? "?"} · {fmt(n.created_at)}
                  </span>
                </li>
              ))}
            </ul>
            <NoteForm action={addNote.bind(null, app.id)} />
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
