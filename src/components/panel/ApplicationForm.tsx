"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { saveApplication } from "@/app/[lang]/panel/actions";
import { panelDict } from "@/content/panel";
import {
  CV_MAX_BYTES,
  EXPERIENCE,
  LEVELS,
  MOTIVATION_MAX,
  PRIOR,
  requiredConsents,
  ROLES,
  submitSchema,
  TEAM_STATUS,
  TSHIRTS,
  UNIVERSITIES,
  visibleConsents,
  type ConsentKey,
  type DraftAnswers,
} from "@/lib/application";
import type { Locale } from "@/lib/i18n";
import { fieldErrors } from "@/lib/submission";
import { createClient } from "@/lib/supabase/client";
import { Choice, describedBy, Field, Group, inputCls, Notice } from "./fields";

/** Fields a participant can still change after submitting (mirrors the database setting). */
const EDITABLE_AFTER_SUBMIT = new Set(["phone", "tshirt", "diet", "emergency_name", "emergency_phone", "github", "linkedin", "portfolio", "cv_path"]);

export default function ApplicationForm({
  lang,
  userId,
  email,
  initial,
  initialConsents,
  locked,
  canSubmit,
  mlhEnabled,
}: {
  lang: Locale;
  userId: string;
  email: string;
  initial: DraftAnswers;
  initialConsents: Partial<Record<ConsentKey, boolean>>;
  /** Already submitted: most fields read-only. */
  locked: boolean;
  /** Applications are open and this is still a draft. */
  canSubmit: boolean;
  mlhEnabled: boolean;
}) {
  const t = panelDict[lang];
  const f = t.form;
  const [a, setA] = useState<DraftAnswers>(initial);
  const [consents, setConsents] = useState(initialConsents);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string; extra?: string } | null>(null);
  const [pending, start] = useTransition();
  const [cvBusy, setCvBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof DraftAnswers>(k: K, v: DraftAnswers[K]) => {
    setA((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };
  const ro = (k: string) => locked && !EDITABLE_AFTER_SUBMIT.has(k);
  const err = (k: string) => (errors[k] ? (t.errors as Record<string, string>)[errors[k]] ?? t.errors.invalid : undefined);

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`#f-${first}`) ?? formRef.current?.querySelector<HTMLElement>(`[id="f-${first}"]`);
    el?.focus();
    el?.scrollIntoView({ block: "center" });
  };

  const run = (submit: boolean) => {
    setResult(null);
    if (submit) {
      const parsed = submitSchema.safeParse(a, { reportInput: true });
      const errs = parsed.success ? {} : fieldErrors(parsed.error.issues);
      for (const k of requiredConsents(mlhEnabled)) if (!consents[k]) errs[`consent_${k}`] = "consent";
      if (Object.keys(errs).length) {
        setErrors(errs);
        setResult({ tone: "error", text: f.fixErrors(Object.keys(errs).length) });
        focusFirstError(errs);
        return;
      }
    }
    start(async () => {
      const r = await saveApplication(lang, a, consents, submit);
      if (!r.ok) {
        setErrors(r.errors ?? {});
        setResult({ tone: "error", text: r.errors ? f.fixErrors(Object.keys(r.errors).length) : t.codes[r.code ?? "unknown"] ?? t.codes.unknown });
        if (r.errors) focusFirstError(r.errors);
        return;
      }
      setErrors({});
      setResult({ tone: "ok", text: submit ? f.submitted : t.saved, extra: r.emailSkipped ? t.emailSkipped : undefined });
    });
  };

  const uploadCv = async (file: File) => {
    setErrors(({ cv_path: _drop, ...rest }) => rest);
    if (file.type !== "application/pdf") return setErrors((e) => ({ ...e, cv_path: "cv_type" }));
    if (file.size > CV_MAX_BYTES) return setErrors((e) => ({ ...e, cv_path: "cv_size" }));
    setCvBusy(true);
    const path = `${userId}/cv.pdf`;
    const { error } = await createClient().storage.from("cvs").upload(path, file, { upsert: true, contentType: "application/pdf" });
    setCvBusy(false);
    if (error) return setErrors((e) => ({ ...e, cv_path: "cv_upload" }));
    set("cv_path", path);
  };

  const removeCv = async () => {
    setCvBusy(true);
    await createClient().storage.from("cvs").remove([a.cv_path]);
    setCvBusy(false);
    set("cv_path", "");
  };

  const text = (k: keyof DraftAnswers, label: string, opts: { hint?: string; optional?: boolean; type?: string; inputMode?: "tel" | "numeric" | "url"; autoComplete?: string; list?: string } = {}) => (
    <Field id={`f-${k}`} label={label} hint={opts.hint} error={err(k)} optionalLabel={opts.optional ? f.optional : undefined}>
      <input
        id={`f-${k}`}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        autoComplete={opts.autoComplete}
        list={opts.list}
        value={a[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        disabled={ro(k)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={describedBy(`f-${k}`, opts.hint, err(k))}
        className={inputCls}
      />
    </Field>
  );

  const select = <K extends "level" | "tshirt" | "experience">(k: K, label: string, options: readonly string[], labels?: Record<string, string>) => (
    <Field id={`f-${k}`} label={label} error={err(k)}>
      <select
        id={`f-${k}`}
        value={a[k]}
        onChange={(e) => set(k, e.target.value as DraftAnswers[K])}
        disabled={ro(k)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={describedBy(`f-${k}`, undefined, err(k))}
        className={inputCls}
      >
        <option value="">{f.options.select}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </Field>
  );

  const consentKeys = locked ? visibleConsents(mlhEnabled) : visibleConsents(mlhEnabled);
  const required = new Set(requiredConsents(mlhEnabled));
  const editableConsents = new Set<ConsentKey>(locked ? ["marketing", "mlh_marketing"] : consentKeys);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(canSubmit && !locked);
      }}
      className="grid gap-10"
    >
      {locked && <Notice>{f.lockedNote}</Notice>}

      <Section title={f.sections.personal}>
        <div className="grid gap-6 sm:grid-cols-2">
          {text("first_name", f.fields.first_name, { autoComplete: "given-name" })}
          {text("last_name", f.fields.last_name, { autoComplete: "family-name" })}
        </div>
        <Field id="f-email" label={f.fields.email} hint={f.fields.emailHint}>
          <input id="f-email" type="email" value={email} readOnly disabled aria-describedby="f-email-hint" className={inputCls} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          {text("phone", f.fields.phone, { hint: f.fields.phoneHint, type: "tel", inputMode: "tel", autoComplete: "tel" })}
          {text("age", f.fields.age, { hint: f.fields.ageHint, inputMode: "numeric" })}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {text("country", f.fields.country, { autoComplete: "country-name" })}
          {text("city", f.fields.city, { autoComplete: "address-level2" })}
        </div>
      </Section>

      <Section title={f.sections.education}>
        {text("university", f.fields.university, { hint: f.fields.universityHint, list: "universities", autoComplete: "organization" })}
        <datalist id="universities">
          {UNIVERSITIES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        {text("department", f.fields.department)}
        <div className="grid gap-6 sm:grid-cols-2">
          {select("level", f.fields.level, LEVELS, f.options.level)}
          {text("grad_year", f.fields.grad_year, { inputMode: "numeric" })}
        </div>
      </Section>

      <Section title={f.sections.experience}>
        <Group id="f-team_status" legend={f.fields.team_status} error={err("team_status")}>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEAM_STATUS.map((o) => (
              <Choice key={o} type="radio" name="team_status" value={o} checked={a.team_status === o} disabled={ro("team_status")} onChange={() => set("team_status", o)}>
                {f.options.team_status[o]}
              </Choice>
            ))}
          </div>
        </Group>
        <Group id="f-roles" legend={f.fields.roles} hint={f.fields.rolesHint} error={err("roles")}>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3">
            {ROLES.map((o) => (
              <Choice
                key={o}
                type="checkbox"
                name="roles"
                value={o}
                checked={a.roles.includes(o)}
                disabled={ro("roles")}
                onChange={(on) => set("roles", on ? [...a.roles, o] : a.roles.filter((r) => r !== o))}
              >
                {f.options.roles[o]}
              </Choice>
            ))}
          </div>
        </Group>
        {select("experience", f.fields.experience, EXPERIENCE, f.options.experience)}
        <Group id="f-prior_hackathon" legend={f.fields.prior_hackathon} optionalLabel={f.optional} error={err("prior_hackathon")}>
          <div className="grid grid-cols-2 gap-2">
            {PRIOR.map((o) => (
              <Choice key={o} type="radio" name="prior" value={o} checked={a.prior_hackathon === o} disabled={ro("prior_hackathon")} onChange={() => set("prior_hackathon", o)}>
                {f.options.prior_hackathon[o]}
              </Choice>
            ))}
          </div>
        </Group>
        <Field id="f-motivation" label={f.fields.motivation} hint={f.fields.motivationCount(a.motivation.length, MOTIVATION_MAX)} error={err("motivation")}>
          <textarea
            id="f-motivation"
            rows={5}
            maxLength={MOTIVATION_MAX}
            value={a.motivation}
            onChange={(e) => set("motivation", e.target.value)}
            disabled={ro("motivation")}
            aria-invalid={errors.motivation ? true : undefined}
            aria-describedby={describedBy("f-motivation", "count", err("motivation"))}
            className={`${inputCls} py-3`}
          />
        </Field>
      </Section>

      <Section title={f.sections.event}>
        {select("tshirt", f.fields.tshirt, TSHIRTS)}
        {text("diet", f.fields.diet, { hint: f.fields.dietHint, optional: true })}
        <p className="text-[14px] text-muted">{f.fields.emergencyHint}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {text("emergency_name", f.fields.emergency_name)}
          {text("emergency_phone", f.fields.emergency_phone, { type: "tel", inputMode: "tel", hint: f.fields.phoneHint })}
        </div>
      </Section>

      <Section title={f.sections.links}>
        {text("github", f.fields.github, { hint: f.fields.urlHint, optional: true, type: "url", inputMode: "url" })}
        {text("linkedin", f.fields.linkedin, { hint: f.fields.urlHint, optional: true, type: "url", inputMode: "url" })}
        {text("portfolio", f.fields.portfolio, { hint: f.fields.urlHint, optional: true, type: "url", inputMode: "url" })}
        <Field id="f-cv_path" label={f.fields.cv} optionalLabel={f.optional} error={err("cv_path")}>
          {a.cv_path ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[15px]">{f.fields.cvUploaded}</span>
              <button type="button" onClick={removeCv} disabled={cvBusy} className="btn btn-secondary">
                {f.fields.cvRemove}
              </button>
            </div>
          ) : (
            <input
              id="f-cv_path"
              type="file"
              accept="application/pdf"
              disabled={cvBusy}
              aria-describedby={describedBy("f-cv_path", undefined, err("cv_path"))}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCv(file);
              }}
              className="min-h-12 w-full text-[15px] file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-rule file:bg-surface file:px-4 file:font-semibold"
            />
          )}
          {cvBusy && <span className="text-[14px] text-muted">{f.fields.cvUploading}</span>}
        </Field>
      </Section>

      <Section title={f.sections.consents}>
        {mlhEnabled && lang === "tr" && <p className="text-[14px] text-muted">{f.mlhNote}</p>}
        <div className="grid gap-3">
          {consentKeys.map((k) => {
            const c = f.consents[k] as { text: string; translation?: string; links: { href: string; label: string }[] };
            const id = `f-consent_${k}`;
            const e = errors[`consent_${k}`] ? t.errors.consent : undefined;
            return (
              <div key={k} className="grid gap-2">
                <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-rule bg-surface px-4 py-3 text-[15px] has-[:checked]:border-ink">
                  <input
                    id={id}
                    type="checkbox"
                    checked={!!consents[k]}
                    disabled={!editableConsents.has(k)}
                    onChange={(ev) => {
                      setConsents((p) => ({ ...p, [k]: ev.target.checked }));
                      if (errors[`consent_${k}`]) setErrors(({ [`consent_${k}`]: _drop, ...rest }) => rest);
                    }}
                    aria-invalid={e ? true : undefined}
                    aria-describedby={e ? `${id}-err` : undefined}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                  />
                  <span className="grid min-w-0 gap-1">
                    <span>
                      {c.text}{" "}
                      <span className="text-[13px] text-muted">({required.has(k) ? f.required : f.optional})</span>
                    </span>
                    {c.translation && <span className="text-[14px] text-muted">{c.translation}</span>}
                  </span>
                </label>
                {c.links.length > 0 && (
                  <p className="flex flex-wrap gap-x-4 pl-4 text-[14px]">
                    {c.links.map((l) =>
                      l.href.startsWith("/") ? (
                        <Link key={l.href} href={l.href} target="_blank" className="link inline-flex min-h-11 items-center">
                          {l.label}
                        </Link>
                      ) : (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center">
                          {l.label}
                        </a>
                      )
                    )}
                  </p>
                )}
                {e && (
                  <p id={`${id}-err`} className="pl-4 text-[14px] font-medium text-accent">
                    {e}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-4">
        {result && (
          <Notice tone={result.tone}>
            {result.text}
            {result.extra && (
              <>
                <br />
                {result.extra}
              </>
            )}
          </Notice>
        )}
        <div className="flex flex-wrap gap-3">
          {locked ? (
            <button type="submit" disabled={pending || cvBusy} className="btn btn-primary disabled:opacity-60">
              {pending ? f.saving : f.saveChanges}
            </button>
          ) : (
            <>
              {canSubmit && (
                <button type="submit" disabled={pending || cvBusy} className="btn btn-primary disabled:opacity-60">
                  {pending ? f.saving : f.submit}
                </button>
              )}
              <button type="button" onClick={() => run(false)} disabled={pending || cvBusy} className="btn btn-secondary disabled:opacity-60">
                {f.saveDraft}
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6">
      <h3 className="border-b border-rule pb-2 text-[18px] font-semibold">{title}</h3>
      {children}
    </section>
  );
}
