import { Resend } from "resend";

/**
 * Best-effort transactional email — callers should never let a failure here
 * break the request they're handling (e.g. a password reset request must
 * still be saved and visible in the admin panel even if the email bounces).
 * Defaults to Resend's shared "onboarding@resend.dev" sender, which needs
 * no domain verification and can send to any recipient; set RESEND_FROM_EMAIL
 * once a real sending domain is verified in the Resend dashboard.
 */
export async function sendAdminNotification(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "People & Growth <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}
