"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dict } from "@/lib/dict";

/*
 * "Build your team" card: pick roles, fill a five-line roster, and the status
 * line explains the team rule (3-5 people, solo applicants matched on Saturday).
 * Nothing leaves the page; the last team is kept in sessionStorage as a convenience.
 * No names or avatars: seats only show "You" and roles.
 */

const STORE = "ha-team";
const SEATS = 5;

type Role = string;
type Team = { you: Role | null; mates: (Role | null)[] };
const EMPTY: Team = { you: null, mates: [null, null, null, null] };

export default function TeamBuilder({
  t,
  roles,
  actionHref,
  actionLabel,
  noTeamHref,
}: {
  t: Dict["team"];
  /** Role keys and labels, same list as the application form. */
  roles: { key: string; label: string }[];
  actionHref: string;
  actionLabel: string;
  noTeamHref: string;
}) {
  const [team, setTeam] = useState<Team>(EMPTY);
  // Bumped per seat when it fills, so the entrance animation replays.
  const [pops, setPops] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (!raw) return;
      const v = JSON.parse(raw) as Team;
      const ok = (r: unknown) => r === null || roles.some((x) => x.key === r);
      if (ok(v.you) && Array.isArray(v.mates) && v.mates.length === SEATS - 1 && v.mates.every(ok)) setTeam(v);
    } catch {}
  }, [roles]);

  const save = (next: Team) => {
    setTeam(next);
    try {
      sessionStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  };
  const pop = (seat: number) => setPops((p) => p.map((v, i) => (i === seat ? v + 1 : v)));

  const add = (role: Role) => {
    if (team.you === null) {
      save({ ...team, you: role });
      pop(0);
      return;
    }
    const free = team.mates.indexOf(null);
    if (free === -1) return;
    save({ ...team, mates: team.mates.map((m, i) => (i === free ? role : m)) });
    pop(free + 1);
  };
  const removeMate = (i: number) => save({ ...team, mates: team.mates.map((m, j) => (j === i ? null : m)) });

  const filled = [team.you, ...team.mates].filter((r): r is Role => r !== null);
  const count = 1 + team.mates.filter((m) => m !== null).length;
  const full = count === SEATS;
  const status = count >= SEATS ? t.status.full : count >= 3 ? t.status.ready : t.status.low;
  const tip = count >= 3 ? (!filled.includes("design") ? t.tips.design : !filled.includes("product") ? t.tips.product : null) : null;
  const label = (key: Role | null) => roles.find((r) => r.key === key)?.label ?? "";

  /** One line of the roster. Filled lines are buttons that clear the seat; the action is read after the visible text. */
  const seat = (i: number) => {
    const role = i === 0 ? team.you : team.mates[i - 1];
    const no = (
      <span aria-hidden="true" className={`font-mono text-[12px] tabular-nums ${role || i === 0 ? "text-accent-ink" : "text-muted"}`}>
        {String(i + 1).padStart(2, "0")}
      </span>
    );
    const row = "grid min-h-[52px] w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-rule px-1 text-left";

    if (i === 0) {
      return (
        <li key={`s0-${pops[0]}`}>
          <button
            type="button"
            disabled={team.you === null}
            onClick={() => save({ ...team, you: null })}
            className={`${row} group/s ${role ? "ha-row" : ""} disabled:cursor-default`}
          >
            {no}
            <span className="poster flex flex-wrap items-baseline gap-x-2.5 text-[24px] leading-none sm:text-[28px]">
              <span className="text-accent">{t.you}</span>
              {role && <span className="text-ink">{label(role)}</span>}
            </span>
            {role && <span className="sr-only">. {t.remove.replace("{role}", label(role))}</span>}
            {role && <Cross />}
          </button>
        </li>
      );
    }
    if (!role) {
      return (
        <li key={`s${i}`} className={row}>
          {no}
          <span aria-hidden="true" className="h-px bg-[repeating-linear-gradient(90deg,var(--rule)_0_8px,transparent_8px_14px)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{t.empty}</span>
        </li>
      );
    }
    return (
      <li key={`s${i}-${pops[i]}`}>
        <button type="button" onClick={() => removeMate(i - 1)} className={`${row} ha-row group/s`}>
          {no}
          <span className="poster text-[24px] leading-none text-ink sm:text-[28px]">{label(role)}</span>
          <span className="sr-only">. {t.remove.replace("{role}", label(role))}</span>
          <Cross />
        </button>
      </li>
    );
  };

  return (
    <div className="grid w-full gap-6 rounded-2xl border border-rule bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <p className="poster text-[30px] text-ink md:text-[36px]">{t.label}</p>
        <p aria-hidden="true" className="poster text-[44px] leading-[0.8] md:text-[56px]">
          <span className={full ? "text-ink" : "text-accent"}>{count}</span>
          <span className="outline-text">/{SEATS}</span>
        </p>
      </div>

      <div role="group" aria-label={t.roles} className="flex flex-wrap gap-2">
        {roles.map((r) => {
          const on = filled.includes(r.key);
          return (
            <button
              key={r.key}
              type="button"
              aria-pressed={on}
              disabled={full}
              onClick={() => add(r.key)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                on ? "border-accent bg-accent text-on-accent" : "border-rule text-ink hover:border-ink"
              }`}
            >
              <span aria-hidden="true">+</span>
              {r.label}
            </button>
          );
        })}
      </div>

      <ol className="border-t border-rule">{Array.from({ length: SEATS }, (_, i) => seat(i))}</ol>

      <div className="grid min-h-[68px] content-start gap-1.5">
        <p aria-live="polite" className="text-[15px] font-medium leading-snug">
          <span className="sr-only">{t.count.replace("{n}", String(count))}. </span>
          {status}
        </p>
        {tip && <p className="text-[14px] leading-snug text-muted">{tip}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={noTeamHref} className="link inline-flex min-h-11 items-center text-[14px]">
          {t.noTeam}
        </Link>
        {/* Same target and label as the header button: form when open, participant guide otherwise. */}
        <Link href={actionHref} className="btn btn-primary group/tb">
          {actionLabel}
          <span aria-hidden="true" className="transition-transform group-hover/tb:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

/** Small "remove" mark at the end of a filled line. Decoration; the button carries the label. */
function Cross() {
  return (
    <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-rule font-mono text-[14px] text-muted transition-colors group-hover/s:border-accent group-hover/s:bg-accent group-hover/s:text-on-accent">
      ×
    </span>
  );
}
