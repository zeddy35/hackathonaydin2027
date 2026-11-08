"use client";

import { useState, useTransition } from "react";
import { inviteStaff, setRole } from "@/app/admin/actions";
import { msg, ROLE_LABEL } from "./labels";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRoleValue] = useState<"admin" | "judge">("judge");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await inviteStaff(email, role);
          if (r.ok) {
            setEmail("");
            setNote({ ok: true, text: r.message === "invited" ? "Davet e-postası gönderildi; rol atandı." : "Rol verildi." });
          } else setNote({ ok: false, text: msg(r.code) });
        });
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <label className="grid gap-1 text-[13px]">
        E-posta
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11 w-72 max-w-full rounded-lg border border-rule px-3" />
      </label>
      <label className="grid gap-1 text-[13px]">
        Rol
        <select value={role} onChange={(e) => setRoleValue(e.target.value as "admin" | "judge")} className="min-h-11 rounded-lg border border-rule bg-surface px-3">
          <option value="judge">Jüri</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
        {pending ? "Ekleniyor…" : "Ekle"}
      </button>
      {note && <p role={note.ok ? "status" : "alert"} className={`w-full text-[14px] ${note.ok ? "text-emerald-800" : "text-accent"}`}>{note.text}</p>}
    </form>
  );
}

export function RoleSelect({ userId, role, canOwner }: { userId: string; role: string; canOwner: boolean }) {
  const [value, setValue] = useState(role);
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const options = ["participant", "judge", "admin", ...(canOwner ? ["owner"] : [])];
  return (
    <span className="grid gap-1">
      <span className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={`r-${userId}`}>
          Rol
        </label>
        <select id={`r-${userId}`} value={value} onChange={(e) => setValue(e.target.value)} className="min-h-11 rounded-lg border border-rule bg-surface px-3 text-[14px]">
          {options.map((o) => (
            <option key={o} value={o}>
              {ROLE_LABEL[o]}
            </option>
          ))}
        </select>
        {value !== role && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await setRole(userId, value as "participant");
                setNote(r.ok ? null : msg(r.code));
                if (!r.ok) setValue(role);
              })
            }
            className="btn btn-primary min-h-11 py-2"
          >
            Kaydet
          </button>
        )}
      </span>
      {note && <span role="alert" className="text-[13px] text-accent">{note}</span>}
    </span>
  );
}
