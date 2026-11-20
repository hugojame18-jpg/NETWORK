import "server-only";

/**
 * Hosting on Netlify, with the network's own account.
 *
 * The token lives in NETLIFY_AUTH_TOKEN on the server and never reaches a
 * browser. Without it the feature still works as a download: the affiliate
 * drops the zip on app.netlify.com/drop.
 */
const API = "https://api.netlify.com/api/v1";

export function netlifyConfigured(): boolean {
  return Boolean(process.env.NETLIFY_AUTH_TOKEN?.trim());
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN!.trim()}`,
    ...extra,
  };
}

async function fail(res: Response, what: string): Promise<never> {
  const body = await res.text().catch(() => "");
  console.error(`[netlify] ${what} → ${res.status} ${body.slice(0, 300)}`);
  throw new Error(`Netlify a refusé : ${what} (${res.status}).`);
}

export interface NetlifySite {
  id: string;
  host: string;
}

export async function createNetlifySite(): Promise<NetlifySite> {
  const res = await fetch(`${API}/sites`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: "{}",
  });
  if (!res.ok) await fail(res, "création du site");
  const json = (await res.json()) as { id: string; default_domain?: string; subdomain?: string };
  const host = json.default_domain ?? `${json.subdomain}.netlify.app`;
  return { id: json.id, host };
}

export async function deployZip(siteId: string, zip: Uint8Array): Promise<void> {
  const res = await fetch(`${API}/sites/${encodeURIComponent(siteId)}/deploys`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/zip" }),
    body: zip as unknown as BodyInit,
  });
  if (!res.ok) await fail(res, "mise en ligne");
}

export async function attachDomain(siteId: string, domain: string): Promise<void> {
  const res = await fetch(`${API}/sites/${encodeURIComponent(siteId)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ custom_domain: domain }),
  });
  if (!res.ok) await fail(res, "ajout du domaine");
}
