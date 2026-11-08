"use client";

/*
 * Small accessible form primitives for the panel and admin forms.
 * Every hint and error is tied to its control with aria-describedby.
 */

export const inputCls =
  "min-h-12 w-full rounded-lg border border-rule bg-surface px-4 text-[16px] outline-none transition-colors placeholder:text-muted/70 focus:border-ink aria-[invalid=true]:border-accent disabled:bg-bg disabled:text-muted";

export function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
}

export function Field({
  id,
  label,
  hint,
  error,
  optionalLabel,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-2">
      <label htmlFor={id} className="text-[15px] font-medium">
        {label}
        {optionalLabel && <span className="ml-2 text-[13px] font-normal text-muted">({optionalLabel})</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-[14px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-[14px] font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function Group({
  id,
  legend,
  hint,
  error,
  optionalLabel,
  children,
}: {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset id={id} tabIndex={-1} aria-describedby={describedBy(id, hint, error)} className="grid gap-2 outline-none">
      <legend className="mb-2 text-[15px] font-medium">
        {legend}
        {optionalLabel && <span className="ml-2 text-[13px] font-normal text-muted">({optionalLabel})</span>}
      </legend>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-[14px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-[14px] font-medium text-accent">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Choice({
  type,
  name,
  value,
  checked,
  disabled,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-rule bg-surface px-4 py-3 text-[15px] has-[:checked]:border-ink has-[:disabled]:cursor-default has-[:disabled]:opacity-70">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span className="min-w-0">{children}</span>
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const cls =
    tone === "error"
      ? "border-accent/30 bg-accent-tint"
      : tone === "ok"
        ? "border-emerald-700/30 bg-emerald-50"
        : "border-rule bg-surface";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-[15px] ${cls}`}>
      {children}
    </p>
  );
}
