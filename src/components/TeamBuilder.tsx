"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dict } from "@/lib/dict";

/*
 * "Build your team" card: pick roles, fill a five-seat round table, and the status
 * line explains the team rule (3-5 people, solo applicants matched on Saturday).
 * Nothing leaves the page; the last team is kept in sessionStorage as a convenience.
 * No names or avatars: seats only show "You" and roles.
 */

const STORE = "ha-team";
const SEATS = 5;
/** Seat positions around the table, clockwise from the top (degrees). */
const ANGLES = [-90, -18, 54, 126, 198];

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
  // Bumped per seat when it fills, so the pop animation replays.
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

  const seat = (i: number) => {
    const role = i === 0 ? team.you : team.mates[i - 1];
    const base =
      "absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center font-mono text-[11px] leading-tight sm:h-[72px] sm:w-[72px] sm:text-[12px]";
    const pos = { left: `${50 + 40 * Math.cos((ANGLES[i] * Math.PI) / 180)}%`, top: `${50 + 40 * Math.sin((ANGLES[i] * Math.PI) / 180)}%` };

    if (i === 0) {
      return (
        <button
          key={`s0-${pops[0]}`}
          type="button"
          style={pos}
          disabled={team.you === null}
          onClick={() => save({ ...team, you: null })}
          aria-label={role ? `${t.you}, ${label(role)}. ${t.remove.replace("{role}", label(role))}` : t.you}
          className={`${base} ha-seat border-2 border-ink bg-ink text-white disabled:cursor-default`}
        >
          <span className="grid gap-0.5 px-1">
            <span className="font-semibold">{t.you}</span>
            {role && <span className="text-[10px] text-white/80 sm:text-[11px]">{label(role)}</span>}
          </span>
        </button>
      );
    }
    if (!role) {
      return (
        <span key={`s${i}`} style={pos} className={`${base} border-2 border-dashed border-rule bg-bg text-muted`}>
          <span className="sr-only">{t.empty}</span>
        </span>
      );
    }
    return (
      <button
        key={`s${i}-${pops[i]}`}
        type="button"
        style={pos}
        onClick={() => removeMate(i - 1)}
        aria-label={t.remove.replace("{role}", label(role))}
        className={`${base} ha-seat border-2 border-accent bg-accent-tint px-1 text-accent hover:bg-accent hover:text-white`}
      >
        {label(role)}
      </button>
    );
  };

  return (
    <div className="ha-card-enter">
      <div className="relative mx-auto grid w-full max-w-[440px] gap-5 rounded-2xl border border-rule bg-surface p-5 shadow-[0_24px_48px_-28px_rgb(23_23_23/0.25),0_2px_6px_rgb(23_23_23/0.05)] sm:p-6 lg:mr-0">
        <div className="flex items-center justify-between gap-3">
          <p className="label text-accent">{t.label}</p>
          {/* small 4x4 square mark, decoration only */}
          <span aria-hidden="true" className="grid h-3 w-3 grid-cols-4 gap-px">
            {[1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1].map((on, i) => (
              <span key={i} className={on ? "bg-accent" : "bg-rule"} />
            ))}
          </span>
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
                className={`inline-flex min-h-11 items-center rounded-full border px-3.5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  on ? "border-accent bg-accent-tint text-accent" : "border-rule bg-bg text-ink hover:border-ink"
                }`}
              >
                <span aria-hidden="true" className="mr-1.5 text-muted">
                  +
                </span>
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Round table with five seats */}
        <div className="relative mx-auto aspect-square w-full max-w-[280px]">
          <div aria-hidden="true" className="absolute inset-[24%] grid place-items-center rounded-full border border-rule bg-bg">
            <span className="font-mono text-[12px] text-muted">{t.count.replace("{n}", String(count))}</span>
          </div>
          {Array.from({ length: SEATS }, (_, i) => seat(i))}
        </div>

        <div className="grid min-h-[72px] content-start gap-1.5">
          <p aria-live="polite" className="text-[15px] font-medium leading-snug">
            <span className="sr-only">{t.count.replace("{n}", String(count))}. </span>
            {status}
          </p>
          {tip && <p className="text-[14px] leading-snug text-muted">{tip}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule pt-4">
          <Link href={noTeamHref} className="link inline-flex min-h-11 items-center text-[14px]">
            {t.noTeam}
          </Link>
          {/* Same target and label as the header button: form when open, participant guide otherwise. */}
          <Link href={actionHref} className="btn btn-primary group/tb min-h-11 px-4 text-[14px] active:scale-[0.97]">
            {actionLabel}
            <span aria-hidden="true" className="transition-transform group-hover/tb:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
