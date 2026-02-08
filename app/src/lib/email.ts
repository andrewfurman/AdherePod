import sgMail from "@sendgrid/mail";
import { db } from "@/lib/db";
import { emailSends } from "@/lib/db/schema";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

function emailWrapper(content: string): string {
  const year = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://adherepod.com";
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${appUrl}" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" style="padding-right: 8px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 120 120" fill="none"><rect x="10" y="35" width="100" height="50" rx="25" fill="#0f172a"/><rect x="26" y="65" width="5" height="10" rx="2" fill="#ef4444"/><rect x="33" y="57" width="5" height="18" rx="2" fill="#ef4444"/><rect x="40" y="45" width="5" height="30" rx="2" fill="#ef4444"/><rect x="47" y="57" width="5" height="18" rx="2" fill="#ef4444"/><rect x="54" y="65" width="5" height="10" rx="2" fill="#ef4444"/><rect x="64" y="45" width="5" height="30" rx="2" fill="white"/><rect x="71" y="45" width="5" height="18" rx="2" fill="white"/><rect x="78" y="47" width="5" height="14" rx="2" fill="white"/><rect x="85" y="45" width="5" height="18" rx="2" fill="white"/></svg>
                    </td>
                    <td valign="middle">
                      <span style="font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">AdherePod</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px;">&copy; ${year} AdherePod &mdash; Medication adherence made simple.</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${appUrl}" style="color: #9ca3af; text-decoration: underline;">adherepod.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Reset your password</h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">You requested a password reset for your AdherePod account.</p>
    <p style="margin: 0 0 24px;">
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        Reset Password
      </a>
    </p>
    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
      This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
    </p>
  `);

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
    ? `<p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; line-height: 1.5;">Timing: ${timingDescription}</p>`
    : "";
  const notesLine = notes
    ? `<p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.5;">Notes: ${notes}</p>`
    : "";

  const subject = `Reminder: Time to take ${medicationName}`;
  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Time to take ${medicationName}</h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">This is your AdherePod medication reminder.</p>
    ${timingLine}
    ${notesLine}
    <p style="margin: 0 0 24px;">
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View My Medications
      </a>
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
      You can manage your reminder settings on your AdherePod dashboard.
    </p>
  `);

  const response = await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(userId || null, email, "medication_reminder", subject, html, sgMessageId);
}

export async function sendAssignmentNotificationToProvider(
  providerEmail: string,
  providerName: string | null,
  patientName: string | null,
  patientEmail: string,
  providerId?: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/provider-dashboard`;
  const greeting = providerName ? `Hi ${providerName}` : "Hi there";
  const patientDisplay = patientName || patientEmail;

  const subject = `New patient assigned: ${patientDisplay}`;
  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${greeting}, a new patient has been assigned to you</h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">${patientDisplay} (${patientEmail}) has been added to your patient list on AdherePod.</p>
    <p style="margin: 0 0 24px;">
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View Provider Dashboard
      </a>
    </p>
  `);

  const response = await sgMail.send({
    to: providerEmail,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(providerId || null, providerEmail, "assignment_notification", subject, html, sgMessageId);
}

export async function sendAssignmentNotificationToPatient(
  patientEmail: string,
  patientName: string | null,
  providerName: string | null,
  providerType: string | null,
  patientId?: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/my-medications`;
  const greeting = patientName ? `Hi ${patientName}` : "Hi there";
  const typeLabel = providerType ? providerType.replace(/_/g, " ") : "care team member";
  const providerDisplay = providerName ? `${providerName} (${typeLabel})` : `a new ${typeLabel}`;

  const subject = "Your care team has been updated";
  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${greeting}, your care team has been updated</h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">${providerDisplay} has been added to your care team on AdherePod. They can now help manage your medications and view your conversation history.</p>
    <p style="margin: 0 0 24px;">
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View My Medications
      </a>
    </p>
  `);

  const response = await sgMail.send({
    to: patientEmail,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(patientId || null, patientEmail, "assignment_notification", subject, html, sgMessageId);
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
  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${greeting}, here are your medications for today</h2>
    <ul style="padding-left: 20px; margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7;">${medList}</ul>
    <p style="margin: 0 0 24px;">
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
        View My Medications
      </a>
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
      You can manage your daily summary settings on your AdherePod dashboard.
    </p>
  `);

  const response = await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });

  const sgMessageId = extractMessageId(response);
  await logEmailSend(userId || null, email, "daily_summary", subject, html, sgMessageId);
}
