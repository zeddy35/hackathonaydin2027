"use client";

import { useState } from "react";

export default function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={`mailto:${email}`} className="font-mono text-[15px] underline decoration-rule underline-offset-4 hover:decoration-red">
        {email}
      </a>
      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(email); setOk(true); setTimeout(() => setOk(false), 1600); } catch {}
        }}
        className="rounded-sm border border-rule px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.06em] text-muted transition-colors hover:border-ink hover:text-ink"
      >
        {ok ? copied : copy}
      </button>
    </div>
  );
}
