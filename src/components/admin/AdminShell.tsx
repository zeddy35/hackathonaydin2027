import Link from "next/link";
import type { Profile } from "@/lib/supabase/server";
import Logo from "../Logo";
import { ROLE_LABEL } from "./labels";

const NAV: { href: string; label: string; roles: string[] }[] = [
  { href: "/admin", label: "Genel bakış", roles: ["admin", "owner"] },
  { href: "/admin/basvurular", label: "Başvurular", roles: ["admin", "owner"] },
  { href: "/admin/takimlar", label: "Takımlar", roles: ["admin", "owner"] },
  { href: "/admin/checkin", label: "Check-in", roles: ["admin", "owner"] },
  { href: "/admin/puanlama", label: "Puanlama", roles: ["admin", "owner"] },
  { href: "/admin/juri", label: "Jüri ekranı", roles: ["judge", "admin", "owner"] },
  { href: "/admin/eposta", label: "E-posta", roles: ["admin", "owner"] },
  { href: "/admin/icerik", label: "İçerik", roles: ["admin", "owner"] },
  { href: "/admin/hesaplar", label: "Hesaplar", roles: ["admin", "owner"] },
  { href: "/admin/gecmis", label: "İşlem geçmişi", roles: ["admin", "owner"] },
];

/** Shared frame for every admin page: navigation filtered by role, page title. */
export default function AdminShell({
  profile,
  current,
  title,
  actions,
  children,
}: {
  profile: Profile;
  current: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const items = NAV.filter((n) => n.roles.includes(profile.role));
  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href={profile.role === "judge" ? "/admin/juri" : "/admin"} className="inline-flex min-h-11 items-center" aria-label="Yönetim ana sayfası">
              <Logo />
            </Link>
            <span className="tag">Yönetim</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[14px]">
            <span className="text-muted [overflow-wrap:anywhere]">
              {profile.email} · {ROLE_LABEL[profile.role]}
            </span>
            <Link href="/tr" className="link inline-flex min-h-11 items-center">
              Site
            </Link>
            <form action="/auth/signout" method="post">
              <input type="hidden" name="lang" value="tr" />
              <button type="submit" className="btn btn-secondary min-h-10 py-2">
                Çıkış
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Yönetim" className="mx-auto max-w-[1400px] overflow-x-auto px-2 md:px-4">
          <ul className="flex gap-1 whitespace-nowrap">
            {items.map((n) => {
              const active = n.href === current;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center border-b-2 px-3 text-[14px] font-medium ${
                      active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main id="main" className="admin-main mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[30px]">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`grid content-start gap-4 rounded-xl border border-rule bg-surface p-4 md:p-6 ${className}`}>
      {title && <h2 className="text-[18px] font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export const th = "border-b border-rule px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-muted";
export const td = "border-b border-rule px-3 py-2 align-top text-[14px]";
