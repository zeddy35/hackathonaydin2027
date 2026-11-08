"use client";

import { useState, useTransition } from "react";
import {
  deletePerson,
  deleteSponsor,
  savePerson,
  saveSettings,
  saveSponsor,
  type PersonInput,
  type SettingsInput,
  type SponsorInput,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import ActionButton from "./ActionButton";
import { Flag } from "./Badge";
import { msg } from "./labels";

const field = "min-h-11 w-full rounded-lg border border-rule bg-surface px-3 text-[15px]";
const lbl = "grid content-start gap-1 text-[14px] font-medium";

function useSaver() {
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; code?: string }>, ok = "Kaydedildi.") =>
    start(async () => {
      const r = await fn();
      setNote(r.ok ? { ok: true, text: ok } : { ok: false, text: msg(r.code) });
    });
  const view = note && (
    <p role={note.ok ? "status" : "alert"} className={`text-[14px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>
      {note.text}
    </p>
  );
  return { run, pending, view };
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [v, setV] = useState(initial);
  const { run, pending, view } = useSaver();
  const set = <K extends keyof SettingsInput>(k: K, val: SettingsInput[K]) => setV((p) => ({ ...p, [k]: val }));
  const date = (k: "hack_start" | "submission_deadline" | "confirm_deadline" | "teams_lock_at", label: string, hint?: string) => (
    <label className={lbl}>
      {label}
      <input type="datetime-local" value={v[k]} onChange={(e) => set(k, e.target.value)} className={field} />
      {hint && <span className="text-[13px] font-normal text-muted">{hint}</span>}
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveSettings(v), "Kaydedildi. Site birkaç saniye içinde güncellenir.");
      }}
      className="grid gap-6"
    >
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-[14px] font-medium">Başvuru durumu</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["upcoming", "Yakında", "Form kapalı, açılış tarihi gösterilir"],
              ["open", "Açık", "Yeni başvuru alınır"],
              ["closed", "Kapalı", "Yeni başvuru yok, paneller çalışır"],
            ] as const
          ).map(([k, t, d]) => (
            <label key={k} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-rule p-3 has-[:checked]:border-ink">
              <input type="radio" name="status" checked={v.application_status === k} onChange={() => set("application_status", k)} className="mt-1 h-4 w-4" />
              <span>
                <span className="block font-medium">{t}</span>
                <span className="text-[13px] text-muted">{d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={lbl}>
          Açılış zamanı yazısı (TR)
          <input value={v.opens_tr} onChange={(e) => set("opens_tr", e.target.value)} placeholder="Ocak 2027" className={field} />
        </label>
        <label className={lbl}>
          Açılış zamanı yazısı (EN)
          <input value={v.opens_en} onChange={(e) => set("opens_en", e.target.value)} placeholder="January 2027" className={field} />
        </label>
      </div>
      <p className="text-[13px] text-muted">Tüm saatler Türkiye saati.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {date("hack_start", "Geliştirme başlangıcı (teslim açılır)")}
        {date("submission_deadline", "Teslim son saati")}
        {date("confirm_deadline", "Katılım onayı son tarihi", "Boş bırakılabilir")}
        {date("teams_lock_at", "Takımların kilitleneceği zaman", "Boş bırakılabilir")}
      </div>
      <fieldset className="grid gap-3 rounded-lg border border-accent/30 p-4">
        <legend className="px-1 text-[14px] font-medium">MLH</legend>
        <p className="text-[14px] font-medium text-accent">Sadece MLH üyeliği resmî olarak onaylandıktan sonra açın.</p>
        <label className="flex min-h-11 items-center gap-2 text-[14px]">
          <input type="checkbox" checked={v.mlh_enabled} onChange={(e) => set("mlh_enabled", e.target.checked)} className="h-4 w-4" />
          Başvuru formunda MLH onay kutularını göster (mlh_enabled)
        </label>
        <label className="flex min-h-11 items-center gap-2 text-[14px]">
          <input type="checkbox" checked={v.mlh_badge} onChange={(e) => set("mlh_badge", e.target.checked)} className="h-4 w-4" />
          Header'da MLH rozetini göster (mlh_badge)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={lbl}>
            Rozet linki (MLH verir)
            <input value={v.mlh_badge_href} onChange={(e) => set("mlh_badge_href", e.target.value)} className={field} />
          </label>
          <label className={lbl}>
            Rozet görsel adresi (MLH verir)
            <input value={v.mlh_badge_image} onChange={(e) => set("mlh_badge_image", e.target.value)} className={field} />
          </label>
        </div>
      </fieldset>
      <button type="submit" disabled={pending} className="btn btn-primary w-fit disabled:opacity-60">
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
      {view}
    </form>
  );
}

/** Uploads to the public-media bucket (admins only, RLS) and returns the public URL. */
function ImageUpload({ folder, value, onChange }: { folder: string; value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Önizleme" className="h-16 w-auto max-w-[200px] rounded border border-rule bg-white object-contain p-1" />
      )}
      <input
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        aria-label="Görsel yükle"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setError(null);
          if (file.size > 2 * 1024 * 1024) return setError("En fazla 2 MB.");
          setBusy(true);
          const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "png";
          const path = `${folder}/${Date.now()}.${ext}`;
          const db = createClient();
          const { error: upErr } = await db.storage.from("public-media").upload(path, file, { contentType: file.type });
          setBusy(false);
          if (upErr) return setError("Yüklenemedi. Dosya türünü ve boyutunu kontrol et.");
          onChange(db.storage.from("public-media").getPublicUrl(path).data.publicUrl);
        }}
        className="text-[14px] file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-rule file:bg-surface file:px-3"
      />
      {busy && <span className="text-[13px] text-muted">Yükleniyor…</span>}
      {error && <span role="alert" className="text-[13px] text-accent">{error}</span>}
    </div>
  );
}

const TIERS: [string, string][] = [
  ["title", "Ana sponsor"],
  ["gold", "Altın"],
  ["silver", "Gümüş"],
  ["inkind", "Ayni destek"],
  ["tech", "Teknoloji"],
  ["community", "Topluluk"],
];

type SponsorRow = { id: string; name: string; tier: string; logo: string | null; url: string; sort_order: number; published: boolean };

export function SponsorEditor({ rows }: { rows: SponsorRow[] }) {
  const empty: SponsorInput = { id: "", name: "", tier: "gold", logo: "", url: "", sort_order: 0, published: false };
  const [edit, setEdit] = useState<SponsorInput | null>(null);
  const { run, pending, view } = useSaver();
  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {rows.length === 0 && <li className="text-muted">Henüz sponsor yok.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-2 text-[14px]">
            <span className="flex flex-wrap items-center gap-2">
              <strong>{r.name}</strong>
              <span className="text-muted">{TIERS.find((t) => t[0] === r.tier)?.[1]}</span>
              <span className="font-mono text-muted">#{r.sort_order}</span>
              {r.published ? <Flag tone="muted">Yayında</Flag> : <Flag>Yayında değil</Flag>}
            </span>
            <span className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setEdit({ ...r, logo: r.logo ?? "" })} className="btn btn-secondary min-h-11 py-2">
                Düzenle
              </button>
              <ActionButton label="Sil" confirm={`${r.name} silinsin mi?`} action={deleteSponsor.bind(null, r.id)} />
            </span>
          </li>
        ))}
      </ul>
      {edit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const r = await saveSponsor(edit);
              if (r.ok) setEdit(null);
              return r;
            });
          }}
          className="grid gap-4 rounded-lg border border-rule p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={lbl}>
              Ad
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Kategori
              <select value={edit.tier} onChange={(e) => setEdit({ ...edit, tier: e.target.value })} className={field}>
                {TIERS.map(([k, t]) => (
                  <option key={k} value={k}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className={lbl}>
              Link (https://)
              <input required value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Sıra (küçük önce)
              <input type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} className={field} />
            </label>
          </div>
          <div className={lbl}>
            Logo (SVG veya PNG, oran korunur; yoksa ad yazı olarak gösterilir)
            <ImageUpload folder="sponsors" value={edit.logo} onChange={(url) => setEdit({ ...edit, logo: url })} />
            {edit.logo && (
              <button type="button" onClick={() => setEdit({ ...edit, logo: "" })} className="link w-fit text-[13px] font-normal">
                Logoyu kaldır
              </button>
            )}
          </div>
          <label className="flex min-h-11 items-center gap-2 text-[14px]">
            <input type="checkbox" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} className="h-4 w-4" />
            Yayında (sponsor listelenmeyi onayladı)
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
              Kaydet
            </button>
            <button type="button" onClick={() => setEdit(null)} className="btn btn-secondary">
              Vazgeç
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setEdit(empty)} className="btn btn-secondary w-fit">
          Sponsor ekle
        </button>
      )}
      {view}
    </div>
  );
}

type PersonRow = { id: string; name: string; role: string; org: string; photo: string | null; url: string | null; kind: string; sort_order: number; published: boolean };

export function PeopleEditor({ rows }: { rows: PersonRow[] }) {
  const empty: PersonInput = { id: "", name: "", role: "", org: "", photo: "", url: "", kind: "judge", sort_order: 0, published: false };
  const [edit, setEdit] = useState<PersonInput | null>(null);
  const { run, pending, view } = useSaver();
  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {rows.length === 0 && <li className="text-muted">Henüz kimse yok.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-2 text-[14px]">
            <span className="flex flex-wrap items-center gap-2">
              <strong>{r.name}</strong>
              <span className="text-muted">
                {r.kind === "judge" ? "Jüri" : "Mentor"} · {r.role} {r.org && `· ${r.org}`}
              </span>
              {r.published ? <Flag tone="muted">Yayında</Flag> : <Flag>Yayında değil</Flag>}
            </span>
            <span className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setEdit({ ...r, photo: r.photo ?? "", url: r.url ?? "" })} className="btn btn-secondary min-h-11 py-2">
                Düzenle
              </button>
              <ActionButton label="Sil" confirm={`${r.name} silinsin mi?`} action={deletePerson.bind(null, r.id)} />
            </span>
          </li>
        ))}
      </ul>
      {edit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const r = await savePerson(edit);
              if (r.ok) setEdit(null);
              return r;
            });
          }}
          className="grid gap-4 rounded-lg border border-rule p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={lbl}>
              İsim
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Tür
              <select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })} className={field}>
                <option value="judge">Jüri</option>
                <option value="mentor">Mentor</option>
              </select>
            </label>
            <label className={lbl}>
              Unvan
              <input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Kurum
              <input value={edit.org} onChange={(e) => setEdit({ ...edit, org: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Link (https://, isteğe bağlı)
              <input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              Sıra
              <input type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} className={field} />
            </label>
          </div>
          <div className={lbl}>
            Fotoğraf (kare önerilir)
            <ImageUpload folder="people" value={edit.photo} onChange={(url) => setEdit({ ...edit, photo: url })} />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-[14px]">
            <input type="checkbox" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} className="h-4 w-4" />
            Yayında (kişi listelenmeyi kabul etti)
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
              Kaydet
            </button>
            <button type="button" onClick={() => setEdit(null)} className="btn btn-secondary">
              Vazgeç
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setEdit(empty)} className="btn btn-secondary w-fit">
          Kişi ekle
        </button>
      )}
      {view}
    </div>
  );
}
