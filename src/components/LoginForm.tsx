"use client";

import { useState } from "react";
import type { AuthErrorCode } from "@/content/auth";
import { createClient } from "@/lib/supabase/client";

type Labels = {
  emailLabel: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  google: string;
  redirecting: string;
  or: string;
  sentTitle: string;
  sentBody: string; // contains {email}
  again: string;
};

/** Maps Supabase auth errors to a short, actionable message key. */
function classify(err: { status?: number; code?: string; message?: string } | null): AuthErrorCode {
  if (!err) return "unknown";
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  if (err.status === 429 || code.includes("rate_limit") || msg.includes("rate limit")) return "rate_limit";
  if (code === "email_address_invalid" || code === "validation_failed" || msg.includes("invalid")) return "invalid_email";
  if (code === "email_address_not_authorized" || msg.includes("not authorized")) return "not_authorized";
  if (msg.includes("fetch") || msg.includes("network")) return "network";
  return "unknown";
}

export default function LoginForm({
  lang,
  next,
  labels,
  errors,
  initialError,
}: {
  lang: "tr" | "en";
  next: string;
  labels: Labels;
  errors: Record<AuthErrorCode, string>;
  initialError: AuthErrorCode | null;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "google">("idle");
  const [error, setError] = useState<AuthErrorCode | null>(initialError);

  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("invalid_email");
      return;
    }
    setState("sending");
    try {
      const { error: err } = await createClient().auth.signInWithOtp({
        email: value,
        options: { emailRedirectTo: callback(), data: { locale: lang } },
      });
      if (err) {
        setError(classify(err));
        setState("idle");
        return;
      }
      setState("sent"); // only after Supabase confirms
    } catch {
      setError("network");
      setState("idle");
    }
  };

  const google = async () => {
    setError(null);
    setState("google");
    try {
      const { error: err } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback() },
      });
      if (err) {
        setError("oauth");
        setState("idle");
      }
    } catch {
      setError("network");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div role="status" className="grid gap-4 rounded-lg border border-rule bg-surface p-6">
        <h2 className="text-[20px] font-semibold">{labels.sentTitle}</h2>
        <p className="text-muted">{labels.sentBody.replace("{email}", email.trim())}</p>
        <button type="button" onClick={() => setState("idle")} className="link w-fit text-[15px]">
          {labels.again}
        </button>
      </div>
    );
  }

  const busy = state === "sending" || state === "google";

  return (
    <div className="grid gap-6">
      {error && (
        <p role="alert" className="rounded-lg border border-accent/30 bg-accent-tint px-4 py-3 text-[15px] text-ink">
          {errors[error]}
        </p>
      )}

      <form onSubmit={sendLink} noValidate className="grid gap-3">
        <label htmlFor="email" className="text-[15px] font-medium">
          {labels.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          aria-invalid={error === "invalid_email" || undefined}
          className="min-h-12 rounded-lg border border-rule bg-surface px-4 text-[16px] outline-none transition-colors placeholder:text-muted/70 focus:border-ink"
        />
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
          {state === "sending" ? labels.sending : labels.send}
        </button>
      </form>

      <div className="flex items-center gap-4 text-[13px] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-rule" />
        {labels.or}
        <span className="h-px flex-1 bg-rule" />
      </div>

      <button type="button" onClick={google} disabled={busy} className="btn btn-secondary w-full disabled:opacity-60">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-16.6z" />
          <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
        </svg>
        {state === "google" ? labels.redirecting : labels.google}
      </button>
    </div>
  );
}
