/**
 * Transactional email sender.
 *
 * In development (no RESEND_API_KEY), emails are logged to the console instead
 * of being sent — this lets the full auth flow (verification, reset, payment
 * notices) be exercised locally without any external dependency. Setting
 * RESEND_API_KEY switches every call site over to Resend automatically.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

async function sendViaResend({ to, subject, html }: SendEmailInput) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "RevNetwork <no-reply@ccsubmit.io>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }
}

function sendViaConsole({ to, subject, html }: SendEmailInput) {
  console.log(
    [
      "\n──────────── [dev email] ────────────",
      `To:      ${to}`,
      `Subject: ${subject}`,
      "Body:",
      html.replace(/<[^>]+>/g, "").trim(),
      "───────────────────────────────────────\n",
    ].join("\n"),
  );
}

export async function sendEmail(input: SendEmailInput) {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(input);
  } else {
    sendViaConsole(input);
  }
}

export function verificationEmailHtml(name: string, url: string) {
  return `<p>Bonjour ${name},</p><p>Confirmez votre adresse email en cliquant sur le lien ci-dessous :</p><p><a href="${url}">${url}</a></p><p>Ce lien expire dans 24 heures.</p>`;
}

export function passwordResetEmailHtml(name: string, url: string) {
  return `<p>Bonjour ${name},</p><p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau :</p><p><a href="${url}">${url}</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Ce lien expire dans 1 heure.</p>`;
}
