import "server-only";
import QRCode from "qrcode";
import { sendEmail, type SendResult } from "@/lib/email";
import type { Locale } from "@/lib/i18n";
import { renderTemplate, type TemplateData, type TemplateKey } from "./templates";

export type Recipient = { email: string; locale: Locale; name?: string; checkinToken?: string };

/** Sends one template to one person. The confirmation email carries the check-in QR as a PNG attachment. */
export async function notify(to: Recipient, key: TemplateKey, data: TemplateData = {}): Promise<SendResult> {
  const t = renderTemplate(key, to.locale, { ...data, name: data.name ?? to.name });
  const attachments =
    key === "confirmed" && to.checkinToken
      ? [{ filename: "hackathon-aydin-qr.png", content: (await QRCode.toBuffer(to.checkinToken, { width: 512, margin: 2 })).toString("base64") }]
      : undefined;
  return sendEmail({ to: to.email, subject: t.subject, html: t.html, text: t.text, attachments });
}
