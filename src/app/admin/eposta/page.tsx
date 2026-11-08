import AdminShell from "@/components/admin/AdminShell";
import BulkEmail from "@/components/admin/BulkEmail";
import { requireRole, STAFF } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function Email() {
  const { profile } = await requireRole(STAFF, "/admin/eposta");
  return (
    <AdminShell profile={profile} current="/admin/eposta" title="Toplu e-posta">
      {!emailConfigured() && (
        <p role="alert" className="rounded-lg border border-accent/30 bg-accent-tint px-4 py-3 text-[15px]">
          E-posta gönderimi yapılandırılmadı (RESEND_API_KEY ve EMAIL_FROM). Önizleme çalışır ama gönderim yapılmaz.
        </p>
      )}
      <p className="max-w-[70ch] text-[14px] text-muted">
        Her kişiye ayrı e-posta gider; alıcılar birbirini görmez. Kişiye kendi dilinde (TR/EN) şablon gönderilir. E-postaya başkasının kişisel verisini yazma.
      </p>
      <BulkEmail />
    </AdminShell>
  );
}
