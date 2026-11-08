import AdminShell, { Panel } from "@/components/admin/AdminShell";
import { PeopleEditor, SettingsForm, SponsorEditor } from "@/components/admin/ContentTools";
import { requireRole, STAFF } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** ISO → "YYYY-MM-DDTHH:mm" in Türkiye time (UTC+3 all year) for datetime-local inputs. */
const local = (v: unknown) => (typeof v === "string" && v ? new Date(Date.parse(v) + 3 * 3600_000).toISOString().slice(0, 16) : "");

export default async function Content() {
  const { profile, supabase } = await requireRole(STAFF, "/admin/icerik");
  const [{ data: settings }, { data: sponsors }, { data: people }] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase.from("sponsors").select("*").order("tier").order("sort_order"),
    supabase.from("people").select("*").order("kind").order("sort_order"),
  ]);
  const st = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));
  const label = (st.applications_open_label ?? {}) as { tr?: string; en?: string };

  return (
    <AdminShell profile={profile} current="/admin/icerik" title="İçerik">
      <Panel title="Başvuru durumu, tarihler ve MLH">
        <SettingsForm
          initial={{
            application_status: (st.application_status as "upcoming" | "open" | "closed") ?? "upcoming",
            opens_tr: label.tr ?? "",
            opens_en: label.en ?? "",
            hack_start: local(st.hack_start),
            submission_deadline: local(st.submission_deadline),
            confirm_deadline: local(st.confirm_deadline),
            teams_lock_at: local(st.teams_lock_at),
            mlh_enabled: st.mlh_enabled === true,
            mlh_badge: st.mlh_badge === true,
            mlh_badge_href: typeof st.mlh_badge_href === "string" ? st.mlh_badge_href : "",
            mlh_badge_image: typeof st.mlh_badge_image === "string" ? st.mlh_badge_image : "",
          }}
        />
      </Panel>
      <Panel title="Sponsorlar">
        <p className="text-[13px] text-muted">Sadece onaylanan sponsorları yayınla. Yayında olmayanlar sitede görünmez.</p>
        <SponsorEditor rows={sponsors ?? []} />
      </Panel>
      <Panel title="Jüri ve mentorlar">
        <p className="text-[13px] text-muted">Sadece listelenmeyi kabul eden kişileri yayınla. Yayında kimse yoksa bölüm sitede görünmez.</p>
        <PeopleEditor rows={people ?? []} />
      </Panel>
    </AdminShell>
  );
}
