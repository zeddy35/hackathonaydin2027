"use client";

import { useEffect, useState, useTransition } from "react";
import { countRecipients, sendBulkEmail, type BulkEmailInput } from "@/app/admin/actions";
import { renderCustom, renderTemplate, TEMPLATE_KEYS, TEMPLATE_LABELS, type TemplateKey } from "@/emails/templates";
import { msg, STATUS_LABEL } from "./labels";

const GROUPS = ["submitted", "accepted", "waitlisted", "rejected", "confirmed", "declined", "checked_in"];

export default function BulkEmail() {
  const [statuses, setStatuses] = useState<string[]>(["confirmed"]);
  const [template, setTemplate] = useState<TemplateKey | "custom">("reminder");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [marketingOnly, setMarketingOnly] = useState(false);
  const [previewLang, setPreviewLang] = useState<"tr" | "en">("tr");
  const [count, setCount] = useState<number | null>(null);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const input: BulkEmailInput = { statuses, template, subject, body, marketingOnly };
  const key = JSON.stringify([statuses, marketingOnly]);

  useEffect(() => {
    let live = true;
    setCount(null);
    countRecipients({ statuses, template: "reminder", subject: "", body: "", marketingOnly }).then((r) => live && setCount(r.ok ? (r.count ?? 0) : 0));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const preview =
    template === "custom"
      ? renderCustom(previewLang, subject || "(konu)", body || "(metin)", "Ayşe")
      : renderTemplate(template, previewLang, { name: "Ayşe", message: body.trim() || undefined, deadline: "2027-03-31T23:59:00+03:00", title: "Örnek proje" });

  const send = () =>
    start(async () => {
      const r = await sendBulkEmail(input);
      setAsking(false);
      if (!r.ok) setNote({ ok: false, text: msg(r.code) });
      else setNote({ ok: true, text: `${r.count} e-posta gönderildi.${r.message ? ` ${r.message} gönderim başarısız oldu, sunucu kayıtlarına bak.` : ""}` });
    });

  const field = "min-h-11 w-full rounded-lg border border-rule bg-surface px-3 text-[15px]";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-5 rounded-xl border border-rule bg-surface p-4 md:p-6">
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[14px] font-medium">Alıcı grupları (başvuru durumuna göre)</legend>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {GROUPS.map((g) => (
              <label key={g} className="flex min-h-11 items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={statuses.includes(g)}
                  onChange={(e) => setStatuses((s) => (e.target.checked ? [...s, g] : s.filter((x) => x !== g)))}
                  className="h-4 w-4"
                />
                {STATUS_LABEL[g]}
              </label>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2 text-[14px]">
            <input type="checkbox" checked={marketingOnly} onChange={(e) => setMarketingOnly(e.target.checked)} className="h-4 w-4" />
            Sadece duyuru izni verenler (etkinlikle ilgili olmayan duyurular için zorunlu)
          </label>
        </fieldset>
        <label className="grid gap-1 text-[14px] font-medium">
          Şablon
          <select value={template} onChange={(e) => setTemplate(e.target.value as TemplateKey | "custom")} className={field}>
            {TEMPLATE_KEYS.map((k) => (
              <option key={k} value={k}>
                {TEMPLATE_LABELS[k]}
              </option>
            ))}
            <option value="custom">Serbest metin</option>
          </select>
        </label>
        {template === "custom" && (
          <label className="grid gap-1 text-[14px] font-medium">
            Konu
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} className={field} />
          </label>
        )}
        <label className="grid gap-1 text-[14px] font-medium">
          {template === "custom" ? "Metin (paragrafları boş satırla ayır)" : "Ek paragraf (isteğe bağlı, sadece hatırlatma şablonunda kullanılır)"}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={5000} className={`${field} py-2`} />
        </label>
        {template === "custom" && <p className="text-[13px] text-muted">Serbest metin herkese aynı dilde gider; iki dilli yazman önerilir.</p>}
        <p className="text-[15px]" aria-live="polite">
          Alıcı sayısı: <strong className="font-mono">{count ?? "…"}</strong>
        </p>
        {asking ? (
          <div role="alertdialog" aria-labelledby="send-q" className="grid gap-3 rounded-lg border border-accent/30 bg-accent-tint p-3">
            <p id="send-q">{count} kişiye e-posta gönderilecek. Bu işlem geri alınamaz. Emin misin?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" autoFocus disabled={pending} onClick={send} className="btn btn-primary disabled:opacity-60">
                {pending ? "Gönderiliyor…" : "Evet, gönder"}
              </button>
              <button type="button" onClick={() => setAsking(false)} className="btn btn-secondary">
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <button type="button" disabled={!count || pending} onClick={() => setAsking(true)} className="btn btn-primary w-fit disabled:opacity-50">
            Gönder
          </button>
        )}
        {note && <p role={note.ok ? "status" : "alert"} className={`rounded-lg border px-4 py-3 text-[14px] ${note.ok ? "border-emerald-700/30 bg-emerald-50" : "border-accent/30 bg-accent-tint"}`}>{note.text}</p>}
      </div>
      <div className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold">Önizleme</h2>
          <div role="group" aria-label="Önizleme dili" className="flex gap-2">
            {(["tr", "en"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={previewLang === l} onClick={() => setPreviewLang(l)} className={`btn ${previewLang === l ? "btn-primary" : "btn-secondary"} min-w-11`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[14px]">
          <span className="text-muted">Konu:</span> {preview.subject}
        </p>
        <iframe title="E-posta önizlemesi" srcDoc={preview.html} sandbox="" className="h-[560px] w-full rounded-xl border border-rule bg-white" />
        <p className="text-[13px] text-muted">Önizlemedeki ad ve tarih örnektir.</p>
      </div>
    </div>
  );
}
