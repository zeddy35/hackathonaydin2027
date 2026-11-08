"use client";

import { useState, useTransition } from "react";
import { adminAddMember, adminCreateTeam } from "@/app/admin/actions";
import { msg } from "./labels";

export function CreateTeam() {
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await adminCreateTeam(name);
          setNote(r.ok ? "Takım kuruldu." : msg(r.code));
          if (r.ok) setName("");
        });
      }}
      className="grid gap-2"
    >
      <label htmlFor="new-team" className="text-[13px] font-medium">
        Takım adı
      </label>
      <input id="new-team" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} className="min-h-11 rounded-lg border border-rule px-3" />
      <button type="submit" disabled={pending || !name.trim()} className="btn btn-secondary w-fit disabled:opacity-50">
        Takım kur
      </button>
      {note && <p role="status" className="text-[13px]">{note}</p>}
    </form>
  );
}

export function AddToTeam({ userId, teams }: { userId: string; teams: { id: string; label: string }[] }) {
  const [team, setTeam] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!teams.length) return null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await adminAddMember(team, userId);
          setNote(r.ok ? null : msg(r.code));
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label className="sr-only" htmlFor={`t-${userId}`}>
        Takım seç
      </label>
      <select id={`t-${userId}`} value={team} onChange={(e) => setTeam(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-rule bg-surface px-3 text-[14px]">
        <option value="">Takım seç</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending || !team} className="btn btn-secondary min-h-11 py-2 disabled:opacity-50">
        Ekle
      </button>
      {note && <p role="alert" className="w-full text-[13px] text-accent">{note}</p>}
    </form>
  );
}
