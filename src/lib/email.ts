/**
 * Transactional email.
 *
 * Without RESEND_API_KEY every message is printed to the console instead of
 * being sent, so the whole flow can be exercised locally with no external
 * dependency. Setting the key switches every call site over to Resend at once.
 *
 * Sending never throws: an email is a side effect of an action the user already
 * completed (their account exists, their link was delivered), so a mail outage
 * must not turn a success into an error. Failures are logged and reported
 * through the return value for callers that care.
 */

import { appUrl } from "@/lib/app-url";
import { SUPPORT_TELEGRAM } from "@/lib/contact";

const BRAND = "RevNetwork";

function from() {
  return process.env.EMAIL_FROM ?? `${BRAND} <no-reply@revnetwork.live>`;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

interface LayoutInput {
  title: string;
  /** Paragraphs of the message body, as plain text. */
  lines: string[];
  action?: { label: string; url: string };
  /** Shown smaller under the action, e.g. link expiry. */
  footnote?: string;
}

/**
 * Inline styles only, and a table-based shell: email clients strip <style>
 * blocks and have no flexbox worth relying on.
 */
function layout({ title, lines, action, footnote }: LayoutInput): string {
  const paragraphs = lines
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${line}</p>`,
    )
    .join("");

  const button = action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
         <tr><td style="border-radius:8px;background:#6366f1;">
           <a href="${action.url}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${action.label}</a>
         </td></tr>
       </table>
       <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Si le bouton ne fonctionne pas, copie ce lien&nbsp;:<br><a href="${action.url}" style="color:#6366f1;word-break:break-all;">${action.url}</a></p>`
    : "";

  const note = footnote
    ? `<p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">${footnote}</p>`
    : "";

  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:24px 32px;background:#0f172a;">
      <span style="font-size:18px;font-weight:700;color:#ffffff;">rev<span style="color:#818cf8;">.</span></span>
    </td></tr>
    <tr><td style="padding:32px;">
      <h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;color:#0f172a;">${title}</h1>
      ${paragraphs}
      ${button}
      ${note}
    </td></tr>
    <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        ${BRAND} — une question&nbsp;? Écris-nous sur
        <a href="${SUPPORT_TELEGRAM}" style="color:#6366f1;">Telegram</a>.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

/** Readable plain-text alternative, which lifts deliverability and helps spam scores. */
function toText({ title, lines, action, footnote }: LayoutInput): string {
  return [
    title,
    "",
    ...lines.map((line) => line.replace(/<[^>]+>/g, "")),
    action ? `\n${action.label} : ${action.url}` : "",
    footnote ? `\n${footnote.replace(/<[^>]+>/g, "")}` : "",
    `\n—\n${BRAND} — une question ? Écris-nous sur Telegram : ${SUPPORT_TELEGRAM}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

function buildMessage(subject: string, input: LayoutInput): EmailMessage {
  return { subject, html: layout(input), text: toText(input) };
}

async function sendViaResend(to: string, message: EmailMessage) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from(),
      to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

function sendViaConsole(to: string, message: EmailMessage) {
  console.log(
    [
      "\n──────────── [email non envoyé — RESEND_API_KEY absente] ────────────",
      `À      : ${to}`,
      `Objet  : ${message.subject}`,
      "",
      message.text,
      "─────────────────────────────────────────────────────────────────────\n",
    ].join("\n"),
  );
}

/**
 * Sends a message, never throwing. Returns whether it actually left the
 * building, so a caller can tell the user "check your inbox" only when true.
 */
export async function sendEmail(
  to: string,
  message: EmailMessage,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    sendViaConsole(to, message);
    return false;
  }

  try {
    await sendViaResend(to, message);
    return true;
  } catch (error) {
    // Logged, not thrown: the action that triggered this email already
    // succeeded, and failing it now would be a lie to the user.
    console.error(
      `[email] envoi échoué vers ${to} — "${message.subject}"`,
      error,
    );
    return false;
  }
}

/** True when a real provider is configured, for UI copy that promises an email. */
export function emailDeliveryEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function verificationEmail(name: string, url: string): EmailMessage {
  return buildMessage(`Confirme ton adresse email — ${BRAND}`, {
    title: `Bienvenue ${name} 👋`,
    lines: ["Confirme ton adresse email pour activer ton compte."],
    action: { label: "Confirmer mon adresse", url },
    footnote: "Ce lien expire dans 24 heures.",
  });
}

export function passwordResetEmail(name: string, url: string): EmailMessage {
  return buildMessage(`Réinitialise ton mot de passe — ${BRAND}`, {
    title: "Nouveau mot de passe",
    lines: [
      `Bonjour ${name},`,
      "Tu as demandé à réinitialiser ton mot de passe. Choisis-en un nouveau avec le bouton ci-dessous.",
    ],
    action: { label: "Choisir un mot de passe", url },
    footnote:
      "Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email : ton mot de passe actuel reste valable.",
  });
}

export function applicationApprovedEmail(name: string): EmailMessage {
  return buildMessage(`Ta candidature est acceptée — ${BRAND}`, {
    title: "Bienvenue dans le réseau 🎉",
    lines: [
      `Bonjour ${name},`,
      "Ta candidature vient d'être validée : ton dashboard est désormais ouvert.",
      "Tu peux parcourir les offres, demander ton lien d'affiliation, choisir un site à promouvoir et suivre tes statistiques au jour le jour.",
      "Si tu débutes, commence par l'espace Formation.",
    ],
    action: { label: "Accéder à mon dashboard", url: `${appUrl()}/dashboard` },
  });
}

export function applicationRejectedEmail(name: string): EmailMessage {
  return buildMessage(`Ta candidature n'a pas été retenue — ${BRAND}`, {
    title: "Candidature non retenue",
    lines: [
      `Bonjour ${name},`,
      "Merci pour ton intérêt. Ta candidature n'a pas été retenue cette fois-ci.",
      "Si tu penses qu'il s'agit d'une erreur, ou si ta situation évolue, écris-nous sur Telegram et nous la réexaminerons.",
    ],
    action: { label: "Nous contacter", url: SUPPORT_TELEGRAM },
  });
}

export function linkDeliveredEmail(
  name: string,
  offerName: string,
): EmailMessage {
  return buildMessage(`Ton lien pour « ${offerName} » est prêt — ${BRAND}`, {
    title: "Ton lien d'affiliation est prêt 🔗",
    lines: [
      `Bonjour ${name},`,
      `Ton lien pour <strong>${offerName}</strong> est disponible sur ton dashboard, prêt à copier.`,
    ],
    action: { label: "Récupérer mon lien", url: `${appUrl()}/dashboard/links` },
  });
}

export function siteRequestApprovedEmail(
  name: string,
  siteName: string,
): EmailMessage {
  return buildMessage(`Tu peux promouvoir « ${siteName} » — ${BRAND}`, {
    title: "Demande acceptée ✅",
    lines: [
      `Bonjour ${name},`,
      `Ta demande pour promouvoir <strong>${siteName}</strong> est acceptée. Ton lien arrive.`,
    ],
    action: { label: "Voir mes sites", url: `${appUrl()}/dashboard/sites` },
  });
}

export function paymentStatusEmail(
  name: string,
  status: "APPROVED" | "PAID" | "REJECTED",
  amount: string,
): EmailMessage {
  const copy = {
    APPROVED: {
      title: "Paiement approuvé",
      line: `Ta demande de paiement de <strong>${amount}</strong> est approuvée et part au versement.`,
    },
    PAID: {
      title: "Paiement envoyé 💸",
      line: `Ton paiement de <strong>${amount}</strong> a été versé. Compte quelques jours selon ta méthode de paiement.`,
    },
    REJECTED: {
      title: "Paiement refusé",
      line: `Ta demande de paiement de <strong>${amount}</strong> a été refusée. Écris-nous pour en connaître la raison.`,
    },
  }[status];

  return buildMessage(`${copy.title} — ${BRAND}`, {
    title: copy.title,
    lines: [`Bonjour ${name},`, copy.line],
    action: {
      label: "Voir mes paiements",
      url: `${appUrl()}/dashboard/payments`,
    },
  });
}
