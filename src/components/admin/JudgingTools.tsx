"use client";

import { useState, useTransition } from "react";
import { assignJudge, saveCriteria, setFinalists } from "@/app/admin/actions";
import type { Criterion } from "@/lib/judging";
import { msg } from "./labels";

export function AssignJudge({ submissionId, judges }: { submissionId: string; judges: { id: string; label: string }[] }) {
  const [judge, setJudge] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!judges.length) return <span className="text-[13px] text-muted">Eklenecek jüri yok</span>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await assignJudge(submissionId, judge, true);
          setNote(r.ok ? null : msg(r.code));
          if (r.ok) setJudge("");
        });
      }}
      className="flex flex-wrap gap-2"
    >
      <label htmlFor={`j-${submissionId}`} className="sr-only">
        Jüri seç
      </label>
      <select id={`j-${submissionId}`} value={judge} onChange={(e) => setJudge(e.target.value)} className="min-h-11 rounded-lg border border-rule bg-surface px-3 text-[14px]">
        <option value="">Jüri seç</option>
        {judges.map((j) => (
          <option key={j.id} value={j.id}>
            {j.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!judge || pending} className="btn btn-secondary min-h-11 py-2 disabled:opacity-50">
        Ata
      </button>
      {note && <p role="alert" className="w-full text-[13px] text-accent">{note}</p>}
    </form>
  );
}

export function CriteriaEditor({ initial }: { initial: Criterion[] }) {
  const [list, setList] = useState(initial);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const update = (i: number, k: keyof Criterion, v: string) =>
    setList((l) => l.map((c, j) => (j === i ? { ...c, [k]: k === "weight" ? Number(v) : v } : c)));
  const input = "min-h-11 w-full rounded-lg border border-rule px-3 text-[14px]";
  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[14px]">
          <thead>
            <tr className="text-left text-[12px] uppercase text-muted">
              <th className="px-2 py-1">Anahtar</th>
              <th className="px-2 py-1">Türkçe ad</th>
              <th className="px-2 py-1">İngilizce ad</th>
              <th className="px-2 py-1">Ağırlık</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={i}>
                <td className="px-2 py-1">
                  <input aria-label="Anahtar" value={c.key} onChange={(e) => update(i, "key", e.target.value)} className={`${input} font-mono`} />
                </td>
                <td className="px-2 py-1">
                  <input aria-label="Türkçe ad" value={c.tr} onChange={(e) => update(i, "tr", e.target.value)} className={input} />
                </td>
                <td className="px-2 py-1">
                  <input aria-label="İngilizce ad" value={c.en} onChange={(e) => update(i, "en", e.target.value)} className={input} />
                </td>
                <td className="w-24 px-2 py-1">
                  <input aria-label="Ağırlık" type="number" min={0} max={100} value={c.weight} onChange={(e) => update(i, "weight", e.target.value)} className={input} />
                </td>
                <td className="px-2 py-1">
                  <button type="button" onClick={() => setList((l) => l.filter((_, j) => j !== i))} className="btn btn-secondary min-h-11 py-2">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setList((l) => [...l, { key: "", tr: "", en: "", weight: 10 }])} className="btn btn-secondary">
          Ölçüt ekle
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveCriteria(list);
              setNote(r.ok ? { ok: true, text: "Kaydedildi." } : { ok: false, text: msg(r.code) });
            })
          }
          className="btn btn-primary disabled:opacity-60"
        >
          Ölçütleri kaydet
        </button>
      </div>
      {note && <p role={note.ok ? "status" : "alert"} className={`text-[13px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>{note.text}</p>}
      <p className="text-[13px] text-muted">Puanlama başladıktan sonra anahtarları değiştirme; eski puanlar eski anahtarlarla kayıtlı.</p>
    </div>
  );
}

type Row = { id: string; team: string; title: string; mean: string; judges: number; sd: string; finalist: boolean };

export function FinalistPicker({ rows }: { rows: Row[] }) {
  const anyFinalist = rows.some((r) => r.finalist);
  const [picked, setPicked] = useState<Set<string>>(
    new Set(anyFinalist ? rows.filter((r) => r.finalist).map((r) => r.id) : rows.filter((r) => r.mean !== "-").slice(0, 10).map((r) => r.id))
  );
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  if (!rows.length) return <p className="text-muted">Henüz teslim yok.</p>;
  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[14px]">
          <thead>
            <tr className="text-left text-[12px] uppercase text-muted">
              <th className="border-b border-rule px-3 py-2">Finalist</th>
              <th className="border-b border-rule px-3 py-2">Sıra</th>
              <th className="border-b border-rule px-3 py-2">Takım / proje</th>
              <th className="border-b border-rule px-3 py-2 text-right">Ağırlıklı ort.</th>
              <th className="border-b border-rule px-3 py-2 text-right">Jüri</th>
              <th className="border-b border-rule px-3 py-2 text-right">Std. sapma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i === 9 ? "border-b-2 border-accent" : undefined}>
                <td className="border-b border-rule px-3 py-1">
                  <label className="flex min-h-11 items-center">
                    <input
                      type="checkbox"
                      checked={picked.has(r.id)}
                      onChange={(e) =>
                        setPicked((s) => {
                          const n = new Set(s);
                          if (e.target.checked) n.add(r.id);
                          else n.delete(r.id);
                          return n;
                        })
                      }
                      aria-label={`${r.team} finalist`}
                      className="h-4 w-4"
                    />
                  </label>
                </td>
                <td className="border-b border-rule px-3 py-2 font-mono">{i + 1}</td>
                <td className="border-b border-rule px-3 py-2">
                  <strong>{r.team}</strong> <span className="text-muted">· {r.title}</span>
                  {r.finalist && <span className="ml-2 tag">Finalist</span>}
                </td>
                <td className="border-b border-rule px-3 py-2 text-right font-mono">{r.mean}</td>
                <td className="border-b border-rule px-3 py-2 text-right font-mono">{r.judges}</td>
                <td className="border-b border-rule px-3 py-2 text-right font-mono">{r.sd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {asking ? (
        <div role="alertdialog" aria-labelledby="fin-q" className="grid gap-3 rounded-lg border border-accent/30 bg-accent-tint p-3">
          <p id="fin-q">{picked.size} takım finalist olarak kaydedilecek ve final turunda jürilere açılacak. Emin misin?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await setFinalists([...picked]);
                  setAsking(false);
                  setNote(r.ok ? { ok: true, text: `${r.count} finalist kaydedildi.` } : { ok: false, text: msg(r.code) });
                })
              }
              className="btn btn-primary"
            >
              Evet, kaydet
            </button>
            <button type="button" onClick={() => setAsking(false)} className="btn btn-secondary">
              Vazgeç
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAsking(true)} className="btn btn-primary w-fit">
          Finalistleri kaydet ({picked.size})
        </button>
      )}
      {note && <p role={note.ok ? "status" : "alert"} className={`text-[13px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>{note.text}</p>}
    </div>
  );
}
