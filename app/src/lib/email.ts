import sgMail from "@sendgrid/mail";
import { db } from "@/lib/db";
import { emailSends } from "@/lib/db/schema";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function logEmailSend(
  userId: string | null,
  recipientEmail: string,
  messageType: string,
  subject: string,
  htmlBody: string,
  sgMessageId: string | null
): Promise<string> {
  const [row] = await db
    .insert(emailSends)
    .values({
      userId,
      recipientEmail,
      messageType,
      subject,
      htmlBody,
      sgMessageId,
    })
    .returning({ id: emailSends.id });
  return row.id;
}

function extractMessageId(response: Awaited<ReturnType<typeof sgMail.send>>): string | null {
  const headers = response?.[0]?.headers;
  if (headers && typeof headers === "object" && "x-message-id" in headers) {
    return (headers as Record<string, string>)["x-message-id"] || null;
  }
  return null;
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userId?: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  const subject = "Reset your AdherePod password";
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>You requested a password reset for your AdherePod account.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const response = await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(userId || null, email, "password_reset", subject, html, sgMessageId);
}

export async function sendMedicationReminder(
  email: string,
  medicationName: string,
  timingDescription: string | null,
  notes: string | null,
  userId?: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/my-medications`;
  const timingLine = timingDescription
    ? `<p style="color: #6b7280; font-size: 14px;">Timing: ${timingDescription}</p>`
    : "";
  const notesLine = notes
    ? `<p style="color: #6b7280; font-size: 14px;">Notes: ${notes}</p>`
    : "";

  const subject = `Reminder: Time to take ${medicationName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Time to take ${medicationName}</h2>
      <p>This is your AdherePod medication reminder.</p>
      ${timingLine}
      ${notesLine}
      <p>
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px;">
          View My Medications
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px;">
        You can manage your reminder settings on your AdherePod dashboard.
      </p>
    </div>
  `;

  const response = await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(userId || null, email, "medication_reminder", subject, html, sgMessageId);
}

export async function sendDailySummary(
  email: string,
  userName: string | null,
  medications: { name: string; timesPerDay: number; timingDescription: string | null }[],
  userId?: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/my-medications`;
  const greeting = userName ? `Hi ${userName}` : "Hi there";

  const medList = medications
    .map(
      (m) =>
        `<li style="margin-bottom: 8px;"><strong>${m.name}</strong> — ${m.timesPerDay}x/day${m.timingDescription ? ` (${m.timingDescription})` : ""}</li>`
    )
    .join("");

  const subject = "Your medications for today — AdherePod";
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${greeting}, here are your medications for today</h2>
      <ul style="padding-left: 20px;">${medList}</ul>
      <p>
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px;">
          View My Medications
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px;">
        You can manage your daily summary settings on your AdherePod dashboard.
      </p>
    </div>
  `;

  const response = await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(userId || null, email, "daily_summary", subject, html, sgMessageId);
}
