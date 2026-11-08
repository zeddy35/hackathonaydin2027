"use client";

import { useRef, useState, useTransition } from "react";
import { createTeam, joinTeam, leaveTeam, setWantsMatch, type ActionResult } from "@/app/[lang]/panel/actions";
import { panelDict } from "@/content/panel";
import type { Locale } from "@/lib/i18n";
import { describedBy, Field, inputCls, Notice } from "./fields";

export type TeamView = {
  name: string;
  joinCode: string;
  members: { id: string; name: string }[];
  locked: boolean;
  hasSubmission: boolean;
} | null;

export default function TeamCard({
  lang,
  userId,
  team,
  canTeam,
  wantsMatch,
}: {
  lang: Locale;
  userId: string;
  team: TeamView;
  /** Accepted, confirmed or checked in. */
  canTeam: boolean;
  wantsMatch: boolean;
}) {
  const t = panelDict[lang];
  const tt = t.team;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const handle = (kind: "create" | "join" | null, fn: () => Promise<ActionResult>) => {
    setMsg(null);
    setErrors({});
    setBusy(kind);
    start(async () => {
      const r = await fn();
      setBusy(null);
      if (!r.ok) {
        if (r.errors) setErrors(r.errors);
        else setMsg(t.codes[r.code ?? "unknown"] ?? t.codes.unknown);
      }
      setAsking(false);
    });
  };

  if (!canTeam) return <p className="text-muted">{tt.afterAccept}</p>;

  if (team) {
    return (
      <div className="grid gap-5">
        {msg && <Notice tone="error">{msg}</Notice>}
        <div className="grid gap-1">
          <p className="text-[20px] font-semibold">{team.name}</p>
          {team.locked && <p className="text-[14px] text-muted">{tt.locked}</p>}
        </div>
        <div className="grid gap-2">
          <p className="label">{tt.code}</p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-lg border border-rule bg-bg px-4 py-2 font-mono text-[22px] tracking-[0.2em]">{team.joinCode}</code>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(team.joinCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked: the code is visible and selectable */
                }
              }}
              className="btn btn-secondary"
            >
              <span aria-live="polite">{copied ? tt.copied : tt.copy}</span>
            </button>
          </div>
          <p className="text-[14px] text-muted">{tt.codeHint}</p>
        </div>
        <div className="grid gap-2">
          <p className="label">{tt.members(team.members.length)}</p>
          <ul className="grid gap-1">
            {team.members.map((m) => (
              <li key={m.id} className="text-[15px]">
                {m.name}
                {m.id === userId && <span className="ml-2 text-muted">({tt.you})</span>}
              </li>
            ))}
          </ul>
          {team.members.length < 3 && <Notice>{tt.smallWarning}</Notice>}
        </div>
        {!team.locked && !team.hasSubmission && (
          asking ? (
            <div role="group" aria-labelledby="leave-q" className="grid gap-3 rounded-lg border border-accent/30 bg-accent-tint p-4">
              <p id="leave-q">{tt.confirmLeave}</p>
              <div className="flex flex-wrap gap-3">
                <button ref={yesRef} type="button" disabled={pending} onClick={() => handle(null, () => leaveTeam(lang))} className="btn btn-primary">
                  {tt.yesLeave}
                </button>
                <button type="button" onClick={() => setAsking(false)} className="btn btn-secondary">
                  {tt.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAsking(true);
                requestAnimationFrame(() => yesRef.current?.focus());
              }}
              className="btn btn-secondary w-fit"
            >
              {tt.leave}
            </button>
          )
        )}
      </div>
    );
  }

  const errText = (k: string) => (errors[k] ? (t.errors as Record<string, string>)[errors[k]] ?? t.errors.invalid : undefined);

  return (
    <div className="grid gap-6">
      {msg && <Notice tone="error">{msg}</Notice>}
      <p className="text-muted">{tt.none}</p>
      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handle("create", () => createTeam(lang, name));
          }}
          className="grid content-start gap-3 rounded-lg border border-rule p-4"
        >
          <Field id="team-name" label={tt.createLabel} error={errText("team_name")}>
            <input
              id="team-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.team_name ? true : undefined}
              aria-describedby={describedBy("team-name", undefined, errText("team_name"))}
              className={inputCls}
            />
          </Field>
          <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
            {busy === "create" ? tt.creating : tt.create}
          </button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handle("join", () => joinTeam(lang, code));
          }}
          className="grid content-start gap-3 rounded-lg border border-rule p-4"
        >
          <Field id="join-code" label={tt.joinLabel} hint={tt.joinHint} error={errText("join_code")}>
            <input
              id="join-code"
              value={code}
              maxLength={12}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              aria-invalid={errors.join_code ? true : undefined}
              aria-describedby={describedBy("join-code", tt.joinHint, errText("join_code"))}
              className={`${inputCls} font-mono tracking-[0.15em]`}
            />
          </Field>
          <button type="submit" disabled={pending} className="btn btn-secondary disabled:opacity-60">
            {busy === "join" ? tt.joining : tt.join}
          </button>
        </form>
      </div>
      <div className="grid gap-3">
        {wantsMatch ? (
          <>
            <Notice tone="ok">{tt.matchOn}</Notice>
            <button type="button" disabled={pending} onClick={() => handle(null, () => setWantsMatch(lang, false))} className="btn btn-secondary w-fit">
              {tt.matchOff}
            </button>
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => handle(null, () => setWantsMatch(lang, true))} className="btn btn-secondary w-fit">
            {tt.match}
          </button>
        )}
      </div>
    </div>
  );
}
