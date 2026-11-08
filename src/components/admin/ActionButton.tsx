"use client";

import { useRef, useState, useTransition } from "react";
import type { AdminResult } from "@/app/admin/actions";
import { msg } from "./labels";

/**
 * Button for a server action. With `confirm`, it first asks inside the page
 * (no browser dialog). Shows the result next to the button.
 */
export default function ActionButton({
  action,
  label,
  confirm,
  confirmLabel = "Evet, devam et",
  variant = "secondary",
  success,
  className = "",
}: {
  action: () => Promise<AdminResult>;
  label: string;
  confirm?: string;
  confirmLabel?: string;
  variant?: "primary" | "secondary";
  success?: string | ((r: AdminResult) => string);
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const yes = useRef<HTMLButtonElement>(null);

  const run = () =>
    start(async () => {
      const r = await action();
      setAsking(false);
      if (!r.ok) setNote({ ok: false, text: msg(r.code) });
      else if (success) setNote({ ok: true, text: typeof success === "function" ? success(r) : success });
      else setNote(null);
    });

  return (
    <span className={`inline-grid gap-2 ${className}`}>
      {asking ? (
        <span role="group" aria-label={confirm} className="grid gap-2 rounded-lg border border-accent/30 bg-accent-tint p-3 text-[14px]">
          <span>{confirm}</span>
          <span className="flex flex-wrap gap-2">
            <button ref={yes} type="button" disabled={pending} onClick={run} className="btn btn-primary min-h-11 py-2 disabled:opacity-60">
              {pending ? "İşleniyor…" : confirmLabel}
            </button>
            <button type="button" onClick={() => setAsking(false)} className="btn btn-secondary min-h-11 py-2">
              Vazgeç
            </button>
          </span>
        </span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setNote(null);
            if (confirm) {
              setAsking(true);
              requestAnimationFrame(() => yes.current?.focus());
            } else run();
          }}
          className={`btn ${variant === "primary" ? "btn-primary" : "btn-secondary"} min-h-11 py-2 disabled:opacity-60`}
        >
          {pending ? "İşleniyor…" : label}
        </button>
      )}
      {note && (
        <span role={note.ok ? "status" : "alert"} className={`text-[13px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>
          {note.text}
        </span>
      )}
    </span>
  );
}
