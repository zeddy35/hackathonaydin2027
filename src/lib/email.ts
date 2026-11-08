import "server-only";

export type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string /* base64 */ }[];
};

export type SendResult = { sent: number; skipped: boolean; failed: number };

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/**
 * Sends through the Resend HTTP API. Without RESEND_API_KEY / EMAIL_FROM nothing
 * is sent: the call is logged and returns skipped=true, and callers must not
 * tell the user an email went out.
 */
export async function sendEmail(email: Email): Promise<SendResult> {
  const to = Array.isArray(email.to) ? email.to : [email.to];
  if (!emailConfigured()) {
    console.warn(`[email skipped: RESEND_API_KEY or EMAIL_FROM not set] "${email.subject}" to ${to.length} recipient(s)`);
    return { sent: 0, skipped: true, failed: 0 };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments: email.attachments,
      }),
    });
    if (!res.ok) {
      console.error(`[email failed] "${email.subject}": ${res.status} ${await res.text().catch(() => "")}`);
      return { sent: 0, skipped: false, failed: to.length };
    }
    return { sent: to.length, skipped: false, failed: 0 };
  } catch (e) {
    console.error(`[email failed] "${email.subject}":`, e);
    return { sent: 0, skipped: false, failed: to.length };
  }
}

/** One email per recipient (no shared To: lines, so addresses are never exposed to each other). */
export async function sendEach(emails: Email[]): Promise<SendResult> {
  const total: SendResult = { sent: 0, skipped: false, failed: 0 };
  for (const e of emails) {
    const r = await sendEmail(e);
    total.sent += r.sent;
    total.failed += r.failed;
    total.skipped ||= r.skipped;
    if (r.skipped) {
      total.skipped = true;
      break;
    }
  }
  return total;
}
