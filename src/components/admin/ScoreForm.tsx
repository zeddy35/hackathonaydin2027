"use client";

import { useState, useTransition } from "react";
import { saveScore } from "@/app/admin/actions";
import { weighted, type Criterion, type Round } from "@/lib/judging";
import { msg } from "./labels";

/** Phone-friendly score sheet: one large select per criterion. */
export default function ScoreForm({
  submissionId,
  round,
  criteria,
  initial,
  initialComment,
  locked,
}: {
  submissionId: string;
  round: Round;
  criteria: Criterion[];
  initial: Record<string, number>;
  initialComment: string;
  locked: boolean;
}) {
  const [values, setValues] = useState<Record<string, number>>(initial);
  const [comment, setComment] = useState(initialComment);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const complete = criteria.every((c) => values[c.key]);
  const total = weighted(criteria, values);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveScore(submissionId, round, values, comment);
          setNote(r.ok ? { ok: true, text: "Puan kaydedildi." } : { ok: false, text: msg(r.code) });
        });
      }}
      className="grid content-start gap-3 rounded-lg border border-rule bg-bg p-4"
    >
      <fieldset disabled={locked || pending} className="grid gap-3">
        <legend className="sr-only">Puanlar</legend>
        {criteria.map((c) => (
          <label key={c.key} className="grid gap-1 text-[14px] font-medium">
            {c.tr}
            <select
              value={values[c.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [c.key]: Number(e.target.value) }))}
              className="min-h-12 rounded-lg border border-rule bg-surface px-3 text-[16px]"
            >
              <option value="">Seç</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="grid gap-1 text-[14px] font-medium">
          Yorum (isteğe bağlı)
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={2000} className="rounded-lg border border-rule bg-surface p-3 text-[15px]" />
        </label>
      </fieldset>
      <p className="text-[14px]">
        Ağırlıklı puan: <strong className="font-mono">{total === null ? "-" : total.toFixed(2)}</strong>
      </p>
      {!locked && (
        <button type="submit" disabled={pending || !complete} className="btn btn-primary disabled:opacity-50">
          {pending ? "Kaydediliyor…" : "Puanı kaydet"}
        </button>
      )}
      {!complete && !locked && <p className="text-[13px] text-muted">Kaydetmek için tüm ölçütleri puanla.</p>}
      {note && <p role={note.ok ? "status" : "alert"} className={`text-[14px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>{note.text}</p>}
    </form>
  );
}
