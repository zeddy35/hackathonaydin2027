"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { decideApplications } from "@/app/admin/actions";
import { Flag, StatusBadge } from "./Badge";
import { LEVEL_LABEL, msg, ROLE_INTEREST_LABEL, TEAM_STATUS_LABEL } from "./labels";

export type AppRow = {
  id: string;
  name: string;
  email: string;
  university: string;
  department: string;
  level: string;
  teamStatus: string;
  roles: string[];
  submittedAt: string | null;
  status: string;
  minor: boolean;
};

const ACTIONS = [
  { status: "accepted", label: "Kabul et" },
  { status: "waitlisted", label: "Yedeğe al" },
  { status: "rejected", label: "Reddet" },
] as const;

export default function ApplicationsTable({ rows }: { rows: AppRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [asking, setAsking] = useState<(typeof ACTIONS)[number] | null>(null);
  const [sendMail, setSendMail] = useState(true);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const run = () =>
    asking &&
    start(async () => {
      const r = await decideApplications([...selected], asking.status, sendMail);
      setAsking(null);
      if (!r.ok) return setNote({ ok: false, text: msg(r.code) });
      setSelected(new Set());
      setNote({
        ok: true,
        text: `${r.count} başvuru güncellendi.${r.emailSkipped ? " E-posta gönderimi yapılandırılmadığı için e-posta gönderilmedi." : sendMail ? " E-postalar gönderildi." : ""}`,
      });
    });

  return (
    <div className="grid gap-3">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-rule bg-surface p-3">
        <span className="text-[14px]">{selected.size} seçili</span>
        {ACTIONS.map((a) => (
          <button key={a.status} type="button" disabled={!selected.size || pending} onClick={() => setAsking(a)} className="btn btn-secondary min-h-11 py-2 disabled:opacity-50">
            {a.label}
          </button>
        ))}
        <label className="flex min-h-11 items-center gap-2 text-[14px]">
          <input type="checkbox" checked={sendMail} onChange={(e) => setSendMail(e.target.checked)} className="h-4 w-4" />
          Karar e-postası gönder
        </label>
      </div>

      {asking && (
        <div role="alertdialog" aria-labelledby="bulk-q" className="grid gap-3 rounded-xl border border-accent/30 bg-accent-tint p-4">
          <p id="bulk-q">
            {selected.size} başvuru için &ldquo;{asking.label}&rdquo; işlemi yapılacak{sendMail ? " ve her birine karar e-postası gidecek" : ""}. Emin misin?
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" autoFocus disabled={pending} onClick={run} className="btn btn-primary disabled:opacity-60">
              {pending ? "İşleniyor…" : "Evet, uygula"}
            </button>
            <button type="button" onClick={() => setAsking(null)} className="btn btn-secondary">
              Vazgeç
            </button>
          </div>
        </div>
      )}
      {note && (
        <p role={note.ok ? "status" : "alert"} className={`rounded-lg border px-4 py-3 text-[14px] ${note.ok ? "border-emerald-700/30 bg-emerald-50" : "border-accent/30 bg-accent-tint"}`}>
          {note.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-rule bg-surface">
        <table className="w-full min-w-[960px] border-collapse text-[14px]">
          <thead>
            <tr className="text-left text-[12px] uppercase tracking-[0.04em] text-muted">
              <th className="border-b border-rule px-3 py-2">
                <label className="flex min-h-11 items-center">
                  <input
                    type="checkbox"
                    checked={allOn}
                    onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                    aria-label="Bu sayfadaki tümünü seç"
                    className="h-4 w-4"
                  />
                </label>
              </th>
              <th className="border-b border-rule px-3 py-2">Ad</th>
              <th className="border-b border-rule px-3 py-2">Üniversite</th>
              <th className="border-b border-rule px-3 py-2">Bölüm</th>
              <th className="border-b border-rule px-3 py-2">Düzey</th>
              <th className="border-b border-rule px-3 py-2">Takım</th>
              <th className="border-b border-rule px-3 py-2">Rol</th>
              <th className="border-b border-rule px-3 py-2">Başvuru</th>
              <th className="border-b border-rule px-3 py-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-muted">
                  Bu filtrelerle başvuru yok.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? "bg-accent-tint/50" : undefined}>
                <td className="border-b border-rule px-3 py-1">
                  <label className="flex min-h-11 items-center">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} aria-label={`${r.name} seç`} className="h-4 w-4" />
                  </label>
                </td>
                <td className="border-b border-rule px-3 py-2">
                  <Link href={`/admin/basvurular/${r.id}`} className="link font-medium">
                    {r.name}
                  </Link>
                  <div className="text-[12px] text-muted">{r.email}</div>
                  {r.minor && <Flag>18 yaş altı</Flag>}
                </td>
                <td className="border-b border-rule px-3 py-2">{r.university}</td>
                <td className="border-b border-rule px-3 py-2">{r.department}</td>
                <td className="border-b border-rule px-3 py-2">{LEVEL_LABEL[r.level] ?? r.level}</td>
                <td className="border-b border-rule px-3 py-2">{TEAM_STATUS_LABEL[r.teamStatus] ?? ""}</td>
                <td className="border-b border-rule px-3 py-2">{r.roles.map((x) => ROLE_INTEREST_LABEL[x] ?? x).join(", ")}</td>
                <td className="whitespace-nowrap border-b border-rule px-3 py-2 font-mono text-[12px]">
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" }) : ""}
                </td>
                <td className="border-b border-rule px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
