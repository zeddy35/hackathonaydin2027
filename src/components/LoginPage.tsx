import Link from "next/link";
import { redirect } from "next/navigation";
import { authDict, type AuthErrorCode } from "@/content/auth";
import { COC_URL } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { safeNext, supabaseConfigured } from "@/lib/supabase/env";
import { getSession } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: { next?: string; error?: string };
}) {
  const t = authDict[lang];
  const next = safeNext(searchParams.next, pagePath(lang, "panel"));

  if (supabaseConfigured && (await getSession())) redirect(next);

  const initialError =
    searchParams.error && searchParams.error in t.errors ? (searchParams.error as AuthErrorCode) : null;

  return (
    <div className="wrap grid justify-items-center py-16 md:py-24">
      <div className="grid w-full max-w-[420px] gap-8">
        <header className="grid gap-3">
          <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.02em]">{t.login.title}</h1>
          <p className="text-muted">{t.login.lead}</p>
        </header>

        {supabaseConfigured ? (
          <LoginForm
            lang={lang}
            next={next}
            initialError={initialError}
            errors={t.errors}
            labels={{
              emailLabel: t.login.emailLabel,
              emailPlaceholder: t.login.emailPlaceholder,
              send: t.login.send,
              sending: t.login.sending,
              google: t.login.google,
              redirecting: t.login.redirecting,
              or: t.login.or,
              sentTitle: t.login.sentTitle,
              sentBody: t.login.sentBody("{email}"),
              again: t.login.again,
            }}
          />
        ) : (
          <p role="alert" className="rounded-lg border border-rule bg-surface px-4 py-3">
            {t.login.notConfigured}
          </p>
        )}

        <p className="text-[14px] text-muted">
          <Link href={COC_URL} target="_blank" rel="noopener noreferrer" className="link">
            {t.login.terms}
          </Link>
        </p>
      </div>
    </div>
  );
}
