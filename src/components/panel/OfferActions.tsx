"use client";

import { useRef, useState, useTransition } from "react";
import { respondToOffer } from "@/app/[lang]/panel/actions";
import { panelDict } from "@/content/panel";
import type { Locale } from "@/lib/i18n";
import { Notice } from "./fields";

/** Accepted participants confirm or decline. Declining asks once more, in the page (no browser dialog). */
export default function OfferActions({ lang }: { lang: Locale }) {
  const t = panelDict[lang];
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const yesRef = useRef<HTMLButtonElement>(null);

  const act = (decision: "confirmed" | "declined") =>
    start(async () => {
      const r = await respondToOffer(lang, decision);
      if (!r.ok) setMsg({ tone: "error", text: t.codes[r.code ?? "unknown"] ?? t.codes.unknown });
      else if (r.emailSkipped) setMsg({ tone: "ok", text: t.emailSkipped });
      setAsking(false);
    });

  return (
    <div className="grid gap-4">
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {asking ? (
        <div role="group" aria-labelledby="decline-q" className="grid gap-3 rounded-lg border border-accent/30 bg-accent-tint p-4">
          <p id="decline-q" className="text-[15px]">
            {t.offer.confirmDecline}
          </p>
          <div className="flex flex-wrap gap-3">
            <button ref={yesRef} type="button" disabled={pending} onClick={() => act("declined")} className="btn btn-primary disabled:opacity-60">
              {t.offer.yesDecline}
            </button>
            <button type="button" disabled={pending} onClick={() => setAsking(false)} className="btn btn-secondary">
              {t.offer.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending} onClick={() => act("confirmed")} className="btn btn-primary disabled:opacity-60">
            {t.offer.confirm}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setAsking(true);
              requestAnimationFrame(() => yesRef.current?.focus());
            }}
            className="btn btn-secondary"
          >
            {t.offer.decline}
          </button>
        </div>
      )}
    </div>
  );
}
