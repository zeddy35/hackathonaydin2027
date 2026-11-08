"use client";

import { useState } from "react";

export default function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [state, setState] = useState<"idle" | "ok">("idle");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("ok");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      // Clipboard blocked: the address is plain selectable text, so nothing else to do.
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <a href={`mailto:${email}`} className="link inline-flex min-h-11 select-all items-center break-all font-mono text-[15px] text-ink">
        {email}
      </a>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-11 items-center rounded-md px-2 font-mono text-[12px] uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink"
      >
        {state === "ok" ? copied : copy}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "ok" ? copied : ""}
      </span>
    </span>
  );
}
