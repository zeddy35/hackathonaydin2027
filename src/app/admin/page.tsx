import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getSession } from "@/lib/supabase/server";

/** Protected skeleton. The admin panel itself arrives in task 4. Role is read from the database. */
export default async function AdminPage() {
  if (!supabaseConfigured) redirect("/tr/giris?next=/admin");
  const session = await getSession();
  if (!session) redirect("/tr/giris?next=/admin");
  const role = session.profile?.role;
  const allowed = role === "admin" || role === "owner" || role === "judge";

  return (
    <div className="wrap grid gap-8 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6">
        <Link href="/tr" className="min-h-11 content-center">
          <Logo />
        </Link>
        <form action="/auth/signout" method="post">
          <input type="hidden" name="lang" value="tr" />
          <button type="submit" className="btn btn-secondary">
            Çıkış yap
          </button>
        </form>
      </header>

      {allowed ? (
        <section className="grid gap-3">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Yönetim paneli</h1>
          <p className="text-muted">
            {session.user.email} · rol: <strong className="text-ink">{role}</strong>
          </p>
          <p className="max-w-[60ch] text-muted">
            Başvuru yönetimi, e-postalar, check-in, jüri puanlama ve içerik yönetimi 4. görevde eklenecek.
          </p>
        </section>
      ) : (
        <section className="grid gap-3">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Erişim yok</h1>
          <p className="max-w-[60ch] text-muted">
            Bu sayfa organizasyon ekibi ve jüri içindir. Hesabının yetkilendirilmesi gerekiyorsa organizatöre yaz.
          </p>
          <Link href="/tr/panel" className="link w-fit">
            Katılımcı paneline dön
          </Link>
        </section>
      )}
    </div>
  );
}
