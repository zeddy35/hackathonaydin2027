"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { checkIn, lookupCheckin, type CheckinInfo } from "@/app/admin/actions";
import { StatusBadge } from "./Badge";
import { msg } from "./labels";

/**
 * Phone-first check-in. Reads QR codes with the camera (jsQR on video frames);
 * if the camera is unavailable or blocked, search by token, name or email.
 */
export default function CheckinScanner() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const last = useRef("");
  const [camera, setCamera] = useState<"off" | "starting" | "on" | "error">("off");
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<CheckinInfo[]>([]);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera("off");
  }, []);

  useEffect(() => stop, [stop]);

  const lookup = useCallback((q: string) => {
    setNote(null);
    start(async () => {
      const r = await lookupCheckin(q);
      if (!r.ok) {
        setFound([]);
        setNote({ ok: false, text: msg(r.code) });
      } else setFound(r.data as CheckinInfo[]);
    });
  }, []);

  const startCamera = async () => {
    setNote(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("error");
      return;
    }
    setCamera("starting");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (video.current) {
        video.current.srcObject = stream.current;
        await video.current.play();
      }
      setCamera("on");
    } catch {
      setCamera("error");
    }
  };

  useEffect(() => {
    if (camera !== "on") return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      const c = canvas.current;
      if (v && c && v.readyState >= 2) {
        const w = Math.min(640, v.videoWidth);
        const h = Math.round((v.videoHeight / v.videoWidth) * w);
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
          if (code?.data && code.data !== last.current) {
            last.current = code.data;
            navigator.vibrate?.(80);
            lookup(code.data.trim());
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [camera, lookup]);

  const doCheckin = (p: CheckinInfo) =>
    start(async () => {
      const r = await checkIn(p.id);
      if (!r.ok) setNote({ ok: false, text: msg(r.code) });
      else {
        setNote({ ok: true, text: `${p.name} check-in yaptı.` });
        setFound((list) => list.map((x) => (x.id === p.id ? { ...x, status: "checked_in", checkedInAt: new Date().toISOString() } : x)));
        last.current = "";
      }
    });

  return (
    <div className="grid content-start gap-4">
      <div className="grid gap-3 rounded-xl border border-rule bg-surface p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-ink">
          <video ref={video} playsInline muted className={`h-full w-full object-cover ${camera === "on" ? "" : "hidden"}`} />
          {camera !== "on" && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-[15px] text-white">
              {camera === "error"
                ? "Kamera açılamadı (izin verilmedi ya da tarayıcı desteklemiyor). Aşağıdan elle ara."
                : camera === "starting"
                  ? "Kamera açılıyor…"
                  : "QR okutmak için kamerayı aç."}
            </div>
          )}
          <canvas ref={canvas} className="hidden" aria-hidden="true" />
        </div>
        {camera === "on" ? (
          <button type="button" onClick={stop} className="btn btn-secondary">
            Kamerayı kapat
          </button>
        ) : (
          <button type="button" onClick={startCamera} className="btn btn-primary">
            Kamerayı aç
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(query);
        }}
        className="grid gap-2 rounded-xl border border-rule bg-surface p-4"
        role="search"
      >
        <label htmlFor="ci-q" className="text-[14px] font-medium">
          Elle ara: ad ya da e-posta
        </label>
        <div className="flex gap-2">
          <input id="ci-q" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" className="min-h-12 min-w-0 flex-1 rounded-lg border border-rule px-3 text-[16px]" />
          <button type="submit" disabled={pending || query.trim().length < 3} className="btn btn-secondary disabled:opacity-50">
            Ara
          </button>
        </div>
      </form>

      {note && (
        <p role={note.ok ? "status" : "alert"} className={`rounded-lg border px-4 py-3 text-[16px] font-medium ${note.ok ? "border-emerald-700/30 bg-emerald-50" : "border-accent/30 bg-accent-tint"}`}>
          {note.text}
        </p>
      )}

      {found.map((p) => {
        const blocked = p.status !== "confirmed";
        return (
          <div key={p.id} className="grid gap-3 rounded-xl border-2 border-ink bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[22px] font-semibold">{p.name}</p>
              <StatusBadge status={p.status} />
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-[15px]">
              <dt className="text-muted">Üniversite</dt>
              <dd>{p.university || "-"}</dd>
              <dt className="text-muted">Takım</dt>
              <dd>{p.team ?? "Yok"}</dd>
              <dt className="text-muted">Beslenme</dt>
              <dd>{p.diet || "Belirtilmedi"}</dd>
              <dt className="text-muted">Acil durum</dt>
              <dd>{p.hasEmergency ? "Kişi kayıtlı" : "Eksik, sor ve not al"}</dd>
            </dl>
            {p.minor && <p className="rounded-lg bg-accent-tint px-3 py-2 text-[14px] font-medium text-accent">18 yaş altı görünüyor; katılım 18 yaş ve üstüne açık. Kimliği kontrol et ve organizatöre haber ver.</p>}
            {p.status === "checked_in" ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[15px] font-medium">
                Zaten check-in yaptı
                {p.checkedInAt && ` (${new Date(p.checkedInAt).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" })})`}.
              </p>
            ) : blocked ? (
              <p className="rounded-lg bg-accent-tint px-3 py-2 text-[15px] font-medium text-accent">
                {p.status === "accepted" ? msg("not_confirmed") : msg("not_accepted")}
              </p>
            ) : (
              <button type="button" disabled={pending} onClick={() => doCheckin(p)} className="btn btn-primary min-h-14 text-[17px] disabled:opacity-60">
                Check-in yap
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
