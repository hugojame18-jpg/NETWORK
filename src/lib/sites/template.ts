import type { SiteOffer } from "@/lib/validations/site-offer";

/**
 * The page an affiliate publishes.
 *
 * One static HTML file, no script, no third-party request. It says what the
 * offer is — the facts come from the admin's offer settings, never from the
 * affiliate — and its button leads to the offer with this site's sub3 on it.
 * The conditions block sits above the button and cannot be removed: the
 * affiliate edits only the headline.
 */

export interface SiteInput {
  headline: string;
  sub3: string;
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** The offer's link with this site's sub3 on it, replacing any already there. */
export function offerLink(trackingUrl: string, sub3: string): string {
  const url = new URL(trackingUrl);
  url.searchParams.set("sub3", sub3);
  return url.toString();
}

export function renderSite(input: SiteInput, offer: SiteOffer): string {
  const e = escapeHtml;
  const href = e(offerLink(offer.trackingUrl, input.sub3));

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(input.headline)}</title>
<meta name="description" content="${e(offer.summary)}">
<style>
:root{--ink:#14142b;--muted:#5b5d78;--line:#e3e4f0;--brand:#5b5bf0;--bg:#f6f6fb}
*{box-sizing:border-box}
body{margin:0;font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg)}
main{max-width:640px;margin:0 auto;padding:48px 20px 24px}
h1{font-size:clamp(1.7rem,5vw,2.4rem);line-height:1.15;margin:0 0 14px;letter-spacing:-.02em}
.lead{color:var(--muted);font-size:1.05rem;margin:0 0 28px}
.terms{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin:0 0 24px}
.terms h2{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.terms dl{margin:0;display:grid;gap:12px}
.terms dt{font-weight:650;font-size:.92rem}
.terms dd{margin:2px 0 0;color:var(--muted)}
.cta{display:block;text-align:center;background:var(--brand);color:#fff;text-decoration:none;font-weight:700;padding:16px 20px;border-radius:14px}
.cta:hover{filter:brightness(1.07)}
.note{font-size:.85rem;color:var(--muted);margin:12px 0 0;text-align:center}
footer{max-width:640px;margin:0 auto;padding:8px 20px 48px;font-size:.82rem;color:var(--muted);text-align:center}
footer a{color:inherit}
</style>
</head>
<body>
<main>
<h1>${e(input.headline)}</h1>
<p class="lead">${e(offer.summary)}</p>
<section class="terms" aria-label="Conditions de l'offre">
<h2>Conditions de l'offre</h2>
<dl>
<div><dt>Offre</dt><dd>${e(offer.productName)}</dd></div>
<div><dt>Prix aujourd'hui</dt><dd>${e(offer.price)}</dd></div>
<div><dt>Ensuite</dt><dd>${e(offer.recurring)}</dd></div>
<div><dt>Qui vous débite</dt><dd>${e(offer.billedBy)}</dd></div>
<div><dt>Résilier</dt><dd>${e(offer.cancellation)}</dd></div>
</dl>
</section>
<a class="cta" href="${href}" rel="noopener">Continuer vers l'offre</a>
<p class="note">Vous quittez ce site pour la page de l'offre, où vous voyez le détail avant de payer.</p>
</main>
<footer>
<p>${e(offer.companyName)} · <a href="mailto:${e(offer.contactEmail)}">${e(offer.contactEmail)}</a></p>
</footer>
</body>
</html>
`;
}
