import Link from "next/link";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default function NoAccess() {
  return (
    <main id="main" className="wrap grid max-w-[640px] gap-6 py-16">
      <Link href="/tr" className="inline-flex min-h-11 w-fit items-center">
        <Logo />
      </Link>
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Erişim yok</h1>
      <p className="text-muted">
        Bu sayfa organizasyon ekibi ve jüri içindir. Hesabının yetkilendirilmesi gerekiyorsa organizatöre yaz. Jüri hesapları sadece jüri ekranını görür.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/tr/panel" className="btn btn-secondary">
          Katılımcı paneline dön
        </Link>
        <Link href="/admin/juri" className="btn btn-secondary">
          Jüri ekranı
        </Link>
      </div>
    </main>
  );
}
