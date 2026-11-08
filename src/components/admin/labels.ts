/** Admin UI is Turkish only. */

export const STATUS_LABEL: Record<string, string> = {
  draft: "Taslak",
  submitted: "İnceleniyor",
  accepted: "Kabul",
  waitlisted: "Yedek",
  rejected: "Ret",
  confirmed: "Onayladı",
  declined: "Katılmıyor",
  checked_in: "Check-in",
};

export const STATUS_TONE: Record<string, string> = {
  draft: "border-rule text-muted",
  submitted: "border-amber-600/40 bg-amber-50 text-amber-900",
  accepted: "border-sky-700/40 bg-sky-50 text-sky-900",
  waitlisted: "border-violet-700/40 bg-violet-50 text-violet-900",
  rejected: "border-rule bg-bg text-muted",
  confirmed: "border-emerald-700/40 bg-emerald-50 text-emerald-900",
  declined: "border-rule bg-bg text-muted",
  checked_in: "border-emerald-800 bg-emerald-800 text-white",
};

export const ROLE_LABEL: Record<string, string> = { participant: "Katılımcı", judge: "Jüri", admin: "Admin", owner: "Owner" };

export const LEVEL_LABEL: Record<string, string> = {
  highschool: "Lise",
  associate: "Önlisans",
  bachelor: "Lisans",
  graduate: "Yüksek lisans / doktora",
  bootcamp: "Bootcamp",
  vocational: "Mesleki",
  postdoc: "Doktora sonrası",
  not_student: "Öğrenci değil",
  other: "Diğer",
};

export const TEAM_STATUS_LABEL: Record<string, string> = { have: "Takımı var", looking: "Takım arıyor" };
export const ROLE_INTEREST_LABEL: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobil",
  ai_ml: "AI/ML",
  design: "Tasarım",
  product: "Ürün",
  other: "Diğer",
};

export const CODE_MESSAGE: Record<string, string> = {
  forbidden: "Bu işlem için yetkin yok.",
  invalid: "Geçersiz giriş. Alanları kontrol et.",
  invalid_date: "Tarih alanlarından biri geçersiz. Başvuru son tarihi, geliştirme başlangıcı ve teslim son saati zorunlu.",
  invalid_url: "Linkler https:// ile başlamalı.",
  mlh_badge_incomplete: "Rozeti açmak için MLH'nin verdiği link ve görsel adresi gerekli.",
  nothing_selected: "Önce en az bir satır seç.",
  not_found: "Kayıt bulunamadı.",
  already_checked_in: "Bu kişi zaten check-in yaptı.",
  not_confirmed: "Kabul edilmiş ama katılımını onaylamamış. Önce panelden onay vermeli.",
  not_accepted: "Bu kişi kabul edilmemiş. Check-in yapılamaz.",
  not_enough_judges: "Yeterli jüri hesabı yok. Önce Hesaplar'dan jüri ekle.",
  owner_only: "Bunu sadece owner yapabilir.",
  last_owner: "Son owner'ın rolü kaldırılamaz.",
  own_role: "Kendi rolünü değiştiremezsin.",
  owner_cannot_be_deleted: "Owner hesabı silinemez.",
  owner_cannot_be_disabled: "Owner hesabı devre dışı bırakılamaz.",
  disable_not_allowed: "Bu hesap devre dışı bırakılamaz (kendi hesabını kapatamazsın).",
  role_change_not_allowed: "Rol değiştirme yetkin yok.",
  team_full: "Takım dolu (en fazla 5 kişi).",
  round_closed: "Bu tur kapandı; puanlar kilitli.",
  invalid_score: "Puanlar 1 ile 10 arasında tam sayı olmalı.",
  service_key_missing: "Yeni kişiyi davet etmek için sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı. Kişi önce sitede bir kez giriş yaparsa rolünü buradan verebilirsin.",
  invite_failed: "Davet gönderilemedi.",
  no_recipients: "Seçilen gruplarda alıcı yok.",
  email_not_configured: "E-posta gönderimi yapılandırılmadı (RESEND_API_KEY ve EMAIL_FROM). Hiçbir e-posta gönderilmedi.",
  unknown: "Beklenmeyen bir hata oldu. Tekrar dene.",
};

export const msg = (code?: string) => CODE_MESSAGE[code ?? "unknown"] ?? CODE_MESSAGE.unknown;
