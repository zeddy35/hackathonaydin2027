import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

/*
 * Transactional email templates, TR and EN. Plain, readable HTML with a text
 * version. No personal data beyond the recipient's own first name.
 */

export type TemplateKey = "received" | "accepted" | "waitlisted" | "rejected" | "confirmed" | "reminder" | "submission";
export const TEMPLATE_KEYS: TemplateKey[] = ["received", "accepted", "waitlisted", "rejected", "confirmed", "reminder", "submission"];

export type TemplateData = {
  name?: string;
  /** Confirmation deadline, ISO. */
  deadline?: string | null;
  /** Extra paragraph written by the admin (reminder and free text). */
  message?: string;
  /** Project title (submission). */
  title?: string;
};

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  received: "Başvuru alındı",
  accepted: "Kabul (onay linki ve son tarih)",
  waitlisted: "Yedek listesi",
  rejected: "Ret",
  confirmed: "Katılım onaylandı (QR ekli)",
  reminder: "Etkinlik hatırlatması",
  submission: "Teslim alındı",
};

export function formatDate(iso: string, lang: Locale) {
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

const panelUrl = (lang: Locale) => `${siteUrl}/${lang}/panel`;

type Copy = { subject: string; paragraphs: string[]; button?: string };

function copy(key: TemplateKey, lang: Locale, d: TemplateData): Copy {
  const tr = lang === "tr";
  const deadline = d.deadline ? formatDate(d.deadline, lang) : null;
  switch (key) {
    case "received":
      return tr
        ? {
            subject: "Başvurun alındı · Hackathon Aydın 2027",
            paragraphs: ["Başvurun bize ulaştı ve inceleniyor. Sonuç belli olunca sana e-posta göndereceğiz.", "Başvurunun durumunu panelinden takip edebilirsin."],
            button: "Panele git",
          }
        : {
            subject: "Application received · Hackathon Aydın 2027",
            paragraphs: ["We received your application and it is under review. We will email you when there is a decision.", "You can follow your application in your panel."],
            button: "Open your panel",
          };
    case "accepted":
      return tr
        ? {
            subject: "Kabul edildin · Hackathon Aydın 2027",
            paragraphs: [
              "Tebrikler, Hackathon Aydın 2027'ye kabul edildin.",
              deadline
                ? `Yerini ayırmak için ${deadline} tarihine kadar panelinden katılımını onayla. Onaylanmayan yerler yedek listesindekilere açılabilir.`
                : "Yerini ayırmak için panelinden katılımını onayla. Onaylanmayan yerler yedek listesindekilere açılabilir.",
              "Katılamayacaksan panelden \"Katılamayacağım\" seçeneğini işaretle; yerin başka birine geçsin.",
            ],
            button: "Katılımını onayla",
          }
        : {
            subject: "You're in · Hackathon Aydın 2027",
            paragraphs: [
              "Congratulations, you have been accepted to Hackathon Aydın 2027.",
              deadline
                ? `To keep your spot, confirm your attendance in your panel by ${deadline}. Unconfirmed spots may go to people on the waitlist.`
                : "To keep your spot, confirm your attendance in your panel. Unconfirmed spots may go to people on the waitlist.",
              "If you cannot come, choose \"I can't attend\" in your panel so your spot can go to someone else.",
            ],
            button: "Confirm attendance",
          };
    case "waitlisted":
      return tr
        ? {
            subject: "Yedek listesindesin · Hackathon Aydın 2027",
            paragraphs: ["Başvurun için teşekkürler. Şu an yedek listesindesin. Yer açılırsa sana hemen e-posta göndereceğiz.", "Durumunu panelinden takip edebilirsin."],
            button: "Panele git",
          }
        : {
            subject: "You're on the waitlist · Hackathon Aydın 2027",
            paragraphs: ["Thanks for applying. You are on the waitlist for now. If a spot opens up, we will email you right away.", "You can follow your status in your panel."],
            button: "Open your panel",
          };
    case "rejected":
      return tr
        ? {
            subject: "Başvurun hakkında · Hackathon Aydın 2027",
            paragraphs: [
              "Başvurun ve ilgin için teşekkürler. Kontenjan sınırlı olduğu için bu yıl sana yer ayıramadık.",
              "Bu karar senin hakkında bir yargı değil. Gelecek etkinliklerimizde seni görmek isteriz.",
            ],
          }
        : {
            subject: "About your application · Hackathon Aydın 2027",
            paragraphs: [
              "Thank you for applying and for your interest. Spots are limited and we could not offer you one this year.",
              "This is not a judgement of you. We would love to see you at our future events.",
            ],
          };
    case "confirmed":
      return tr
        ? {
            subject: "Katılımın onaylandı · Hackathon Aydın 2027",
            paragraphs: [
              "Katılımın onaylandı. Etkinlik günü kayıt masasında check-in için QR kodunu göster.",
              "QR kodu bu e-postanın ekinde ve panelinde. Kimseyle paylaşma; sana özel.",
            ],
            button: "QR kodumu göster",
          }
        : {
            subject: "Attendance confirmed · Hackathon Aydın 2027",
            paragraphs: [
              "Your attendance is confirmed. Show your QR code at the check-in desk on event day.",
              "The QR code is attached to this email and in your panel. Do not share it; it is yours only.",
            ],
            button: "Show my QR code",
          };
    case "reminder":
      return tr
        ? {
            subject: "Hatırlatma · Hackathon Aydın 2027",
            paragraphs: ["Hackathon Aydın 2027 yaklaşıyor: 17-18 Nisan 2027, Aydın Adnan Menderes Üniversitesi.", ...(d.message ? [d.message] : []), "Check-in için QR kodun panelinde."],
            button: "Panele git",
          }
        : {
            subject: "Reminder · Hackathon Aydın 2027",
            paragraphs: ["Hackathon Aydın 2027 is coming up: 17-18 April 2027, Aydın Adnan Menderes University.", ...(d.message ? [d.message] : []), "Your check-in QR code is in your panel."],
            button: "Open your panel",
          };
    case "submission":
      return tr
        ? {
            subject: "Projen teslim alındı · Hackathon Aydın 2027",
            paragraphs: [`${d.title ? `"${d.title}" ` : "Projen "}teslim alındı. Son saate kadar takımındaki herkes panelden düzenleyebilir.`],
            button: "Teslimi gör",
          }
        : {
            subject: "Project submitted · Hackathon Aydın 2027",
            paragraphs: [`${d.title ? `"${d.title}"` : "Your project"} was submitted. Anyone on your team can edit it in the panel until the deadline.`],
            button: "View submission",
          };
  }
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(lang: Locale, c: Copy, name?: string) {
  const greeting = name ? (lang === "tr" ? `Merhaba ${name},` : `Hi ${name},`) : lang === "tr" ? "Merhaba," : "Hi,";
  const link = panelUrl(lang);
  const html = `<!doctype html>
<html lang="${lang}"><body style="margin:0;background:#fafaf8;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#171717">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#626262;margin:0 0 24px">Hackathon Aydın 2027</p>
<p style="font-size:16px;line-height:1.6;margin:0 0 16px">${esc(greeting)}</p>
${c.paragraphs.map((p) => `<p style="font-size:16px;line-height:1.6;margin:0 0 16px">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
${c.button ? `<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#8a0303;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${esc(c.button)}</a></p>` : ""}
<p style="font-size:13px;line-height:1.6;color:#626262;margin:32px 0 0">${lang === "tr" ? "Bu e-postayı Hackathon Aydın 2027 başvurun nedeniyle aldın." : "You received this email because of your Hackathon Aydın 2027 application."} <a href="${siteUrl}/${lang}" style="color:#626262">${siteUrl.replace(/^https?:\/\//, "")}</a></p>
</div></body></html>`;
  const text = [greeting, "", ...c.paragraphs.flatMap((p) => [p, ""]), ...(c.button ? [`${c.button}: ${link}`, ""] : []), `Hackathon Aydın 2027 · ${siteUrl}/${lang}`].join("\n");
  return { html, text };
}

export function renderTemplate(key: TemplateKey, lang: Locale, data: TemplateData) {
  const c = copy(key, lang, data);
  return { subject: c.subject, ...layout(lang, c, data.name) };
}

/** Free text email written in the admin panel. */
export function renderCustom(lang: Locale, subject: string, body: string, name?: string) {
  const c: Copy = { subject, paragraphs: body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), button: lang === "tr" ? "Panele git" : "Open your panel" };
  return { subject, ...layout(lang, c, name) };
}
