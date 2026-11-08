import type { Locale } from "@/lib/i18n";

const tr = {
  login: {
    title: "Giriş",
    description: "Hackathon Aydın 2027 katılımcı paneline giriş.",
    lead: "Şifre yok. E-postana tek kullanımlık bir giriş linki gönderelim ya da Google hesabınla devam et.",
    emailLabel: "E-posta adresi",
    emailPlaceholder: "ad@ornek.com",
    send: "Giriş linki gönder",
    sending: "Gönderiliyor…",
    google: "Google ile devam et",
    redirecting: "Google'a yönlendiriliyor…",
    or: "ya da",
    sentTitle: "Giriş linki gönderildi.",
    sentBody: (email: string) =>
      `${email} adresine bir giriş linki gönderdik. Linki bu cihazda aç. Birkaç dakika içinde gelmezse gereksiz (spam) klasörüne bak.`,
    again: "Başka bir adres dene",
    terms: "Giriş yaparak davranış kurallarını kabul etmiş olursun.",
    notConfigured: "Giriş sistemi henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.",
  },
  errors: {
    invalid_email: "E-posta adresi geçerli görünmüyor. Yazımını kontrol edip tekrar dene.",
    rate_limit: "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar dene.",
    not_authorized:
      "Giriş e-postası şu an bu adrese gönderilemiyor. Google ile devam et ya da bize e-posta ile yaz.",
    network: "Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.",
    expired: "Giriş linkinin süresi dolmuş ya da daha önce kullanılmış. Yeni bir link iste.",
    link: "Giriş linki doğrulanamadı. Linki isteğin cihaz ve tarayıcıda açtığından emin ol ya da yeni bir link iste.",
    oauth: "Google ile giriş tamamlanamadı. Tekrar dene ya da e-posta ile giriş linki iste.",
    unknown: "Beklenmeyen bir hata oldu. Tekrar dene; sorun sürerse bize yaz.",
  },
  panel: {
    title: "Panel",
    hello: (name: string) => `Merhaba, ${name}.`,
    signedInAs: "Giriş yapılan hesap",
    role: "Rol",
    roles: { participant: "Katılımcı", judge: "Jüri", admin: "Yönetici", owner: "Sahip" },
    soon: "Katılımcı paneli hazırlanıyor. Başvurular Ocak 2027'de açılınca başvurunu buradan yapıp takip edebileceksin.",
    admin: "Yönetim paneline git",
    signOut: "Çıkış yap",
    noProfile: "Profilin bulunamadı. Çıkış yapıp tekrar giriş yap; sorun sürerse bize yaz.",
  },
};

export type AuthDict = typeof tr;

const en: AuthDict = {
  login: {
    title: "Sign in",
    description: "Sign in to the Hackathon Aydın 2027 participant panel.",
    lead: "No password. We email you a one-time sign-in link, or continue with your Google account.",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.com",
    send: "Email me a sign-in link",
    sending: "Sending…",
    google: "Continue with Google",
    redirecting: "Redirecting to Google…",
    or: "or",
    sentTitle: "Sign-in link sent.",
    sentBody: (email: string) =>
      `We sent a sign-in link to ${email}. Open it on this device. If it does not arrive within a few minutes, check your spam folder.`,
    again: "Use a different address",
    terms: "By signing in you agree to the code of conduct.",
    notConfigured: "Sign-in is not set up yet. Please try again later.",
  },
  errors: {
    invalid_email: "That email address does not look valid. Check it and try again.",
    rate_limit: "Too many attempts. Wait a few minutes and try again.",
    not_authorized: "We cannot send a sign-in email to this address right now. Continue with Google or email us.",
    network: "Could not reach the server. Check your connection and try again.",
    expired: "This sign-in link has expired or was already used. Request a new one.",
    link: "We could not verify the sign-in link. Open it in the same browser you requested it from, or request a new one.",
    oauth: "Google sign-in did not complete. Try again or request an email link.",
    unknown: "Something went wrong. Try again; if it keeps happening, email us.",
  },
  panel: {
    title: "Panel",
    hello: (name: string) => `Hello, ${name}.`,
    signedInAs: "Signed in as",
    role: "Role",
    roles: { participant: "Participant", judge: "Judge", admin: "Admin", owner: "Owner" },
    soon: "The participant panel is being built. When applications open in January 2027, you will apply and track your application here.",
    admin: "Go to the admin panel",
    signOut: "Sign out",
    noProfile: "We could not find your profile. Sign out and sign in again; if it persists, email us.",
  },
};

export const authDict: Record<Locale, AuthDict> = { tr, en };
export type AuthErrorCode = keyof AuthDict["errors"];
