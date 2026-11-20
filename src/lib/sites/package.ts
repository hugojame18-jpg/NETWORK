import "server-only";
import { strToU8, zipSync } from "fflate";
import type { SiteOffer } from "@/lib/validations/site-offer";
import { renderSite, type SiteInput } from "./template";

/** The site as the files Netlify (or any host) serves, zipped. */
export function buildSiteZip(input: SiteInput, offer: SiteOffer): Uint8Array {
  return zipSync({ "index.html": strToU8(renderSite(input, offer)) });
}
