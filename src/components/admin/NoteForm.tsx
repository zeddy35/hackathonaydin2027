"use client";

import { useState, useTransition } from "react";
import type { AdminResult } from "@/app/admin/actions";
import { msg } from "./labels";

export default function NoteForm({ action }: { action: (body: string) => Promise<AdminResult> }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await action(body);
          if (r.ok) {
            setBody("");
            setError(null);
          } else setError(msg(r.code));
        });
      }}
      className="grid gap-2"
    >
      <label htmlFor="note" className="text-[13px] font-medium">
        Yeni not
      </label>
      <textarea id="note" value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} className="rounded-lg border border-rule p-3 text-[14px]" />
      {error && <p role="alert" className="text-[13px] text-accent">{error}</p>}
      <button type="submit" disabled={pending || !body.trim()} className="btn btn-secondary w-fit disabled:opacity-50">
        {pending ? "Kaydediliyor…" : "Not ekle"}
      </button>
    </form>
  );
}
