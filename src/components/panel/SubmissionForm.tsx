"use client";

import { useState, useTransition } from "react";
import { saveSubmission } from "@/app/[lang]/panel/actions";
import { panelDict } from "@/content/panel";
import type { Locale } from "@/lib/i18n";
import { fieldErrors, submissionSchema, type SubmissionInput } from "@/lib/submission";
import { describedBy, Field, inputCls, Notice } from "./fields";

export default function SubmissionForm({
  lang,
  initial,
  exists,
  open,
}: {
  lang: Locale;
  initial: SubmissionInput;
  exists: boolean;
  /** Inside the submission window. Outside it the form is read-only. */
  open: boolean;
}) {
  const t = panelDict[lang];
  const s = t.submission;
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<{ tone: "ok" | "error" | "info"; text: string }[]>([]);
  const [saved, setSaved] = useState(exists);
  const [pending, start] = useTransition();

  const set = <K extends keyof SubmissionInput>(k: K, val: SubmissionInput[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors(({ [k]: _d, ...rest }) => rest);
  };
  const err = (k: string) => (errors[k] ? (t.errors as Record<string, string>)[errors[k]] ?? t.errors.invalid : undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotes([]);
    const parsed = submissionSchema.safeParse(v, { reportInput: true });
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error.issues);
      setErrors(errs);
      setNotes([{ tone: "error", text: t.form.fixErrors(Object.keys(errs).length) }]);
      document.getElementById(`s-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    start(async () => {
      const r = await saveSubmission(lang, v);
      if (!r.ok) {
        if (r.errors) setErrors(r.errors);
        setNotes([{ tone: "error", text: r.errors ? t.form.fixErrors(Object.keys(r.errors).length) : t.codes[r.code ?? "unknown"] ?? t.codes.unknown }]);
        return;
      }
      setSaved(true);
      const out: typeof notes = [{ tone: "ok", text: s.saved }];
      if (r.repo === "not_found") out.push({ tone: "error", text: s.repoNotFound });
      if (r.repo === "unknown") out.push({ tone: "info", text: s.repoUnknown });
      if (r.emailSkipped) out.push({ tone: "info", text: t.emailSkipped });
      setNotes(out);
    });
  };

  const input = (k: "title" | "repo_url" | "demo_url" | "slides_url", label: string, hint?: string, optional?: boolean) => (
    <Field id={`s-${k}`} label={label} hint={hint} error={err(k)} optionalLabel={optional ? t.form.optional : undefined}>
      <input
        id={`s-${k}`}
        type={k === "title" ? "text" : "url"}
        inputMode={k === "title" ? undefined : "url"}
        value={v[k]}
        disabled={!open}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={describedBy(`s-${k}`, hint, err(k))}
        className={inputCls}
      />
    </Field>
  );

  const area = (k: "problem" | "description" | "ai_tools", label: string, rows: number, hint?: string) => (
    <Field id={`s-${k}`} label={label} hint={hint} error={err(k)}>
      <textarea
        id={`s-${k}`}
        rows={rows}
        value={v[k]}
        disabled={!open}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={describedBy(`s-${k}`, hint, err(k))}
        className={`${inputCls} py-3`}
      />
    </Field>
  );

  return (
    <form noValidate onSubmit={submit} className="grid gap-6">
      {input("title", s.fields.title)}
      {area("problem", s.fields.problem, 2, s.fields.problemHint)}
      {area("description", s.fields.description, 6)}
      {input("repo_url", s.fields.repo_url, s.fields.repoHint)}
      {area("ai_tools", s.fields.ai_tools, 2, s.fields.aiHint)}
      <div className="grid gap-3">
        {input("demo_url", s.fields.demo_url, s.fields.demoHint, true)}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={v.demo_is_local}
            disabled={!open}
            onChange={(e) => set("demo_is_local", e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          {s.fields.demo_is_local}
        </label>
      </div>
      {input("slides_url", s.fields.slides_url, s.fields.slidesHint, true)}
      {notes.map((n, i) => (
        <Notice key={i} tone={n.tone}>
          {n.text}
        </Notice>
      ))}
      {open && (
        <button type="submit" disabled={pending} className="btn btn-primary w-fit disabled:opacity-60">
          {pending ? s.saving : saved ? s.update : s.save}
        </button>
      )}
    </form>
  );
}
