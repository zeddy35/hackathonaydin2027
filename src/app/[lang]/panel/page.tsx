import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authDict } from "@/content/auth";
import { isLocale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getSession } from "@/lib/supabase/server";

/** Reads the session cookie on every request. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel · Hackathon Aydın 2027", robots: { index: false } };

/** Protected skeleton. The participant panel itself arrives in task 3. */
export default async function PanelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = authDict[lang];
  const login = `${pagePath(lang, "login")}?next=${encodeURIComponent(pagePath(lang, "panel"))}`;
  if (!supabaseConfigured) redirect(login);

  const session = await getSession();
  if (!session) redirect(login);
  const { user, profile } = session;
  const role = profile?.role ?? "participant";

  return (
    <div className="wrap grid gap-10 py-16 md:py-24">
      <header className="grid gap-3">
        <p className="label">Hackathon Aydın 2027</p>
        <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.02em] md:text-[44px]">
          {t.panel.hello(profile?.full_name || user.email || "")}
        </h1>
      </header>

      {!profile && (
        <p role="alert" className="max-w-[60ch] rounded-lg border border-accent/30 bg-accent-tint px-4 py-3">
          {t.panel.noProfile}
        </p>
      )}

      <dl className="grid max-w-[560px] gap-4 rounded-lg border border-rule bg-surface p-6 sm:grid-cols-2">
        <div className="grid gap-1">
          <dt className="label">{t.panel.signedInAs}</dt>
          <dd className="break-all font-mono text-[15px]">{user.email}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="label">{t.panel.role}</dt>
          <dd className="text-[15px]">{t.panel.roles[role]}</dd>
        </div>
      </dl>

      <p className="max-w-[60ch] text-muted">{t.panel.soon}</p>

      <div className="flex flex-wrap gap-3">
        {(role === "admin" || role === "owner" || role === "judge") && (
          <Link href="/admin" className="btn btn-secondary">
            {t.panel.admin}
          </Link>
        )}
        <form action="/auth/signout" method="post">
          <input type="hidden" name="lang" value={lang} />
          <button type="submit" className="btn btn-secondary">
            {t.panel.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
