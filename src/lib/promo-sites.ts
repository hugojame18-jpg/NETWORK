// Catalogue of ready-made sites publishers can ask to promote.
//
// Kept in code rather than in the database: the list is short, changes rarely,
// and adding an entry needs nothing but a URL. Requests reference a site by
// `slug`, so slugs are persisted — never rename one, add a new entry instead.

export interface PromoSite {
  /** Stable identifier stored on SiteRequest.siteSlug. */
  slug: string;
  name: string;
  url: string;
  /** Vertical value from src/lib/verticals.ts, for the icon and label. */
  category: string;
  description: string;
}

export const PROMO_SITES: PromoSite[] = [
  {
    slug: "centralfoot",
    name: "Central Foot",
    url: "https://centralfoot.site/",
    category: "E-commerce",
    description:
      "Boutique de maillots de football — clubs, nations et rétro. Offres de déstockage et livraison offerte, pensée pour la conversion.",
  },
  {
    slug: "flatlay",
    name: "Flatlay",
    url: "https://flatlay.site/#/",
    category: "E-commerce",
    description: "Boutique lifestyle au design épuré, orientée mobile et réseaux sociaux.",
  },
  {
    slug: "studioneige",
    name: "Studio Neige",
    url: "https://studioneige.site/",
    category: "E-commerce",
    description: "Vitrine produit haut de gamme, idéale pour du trafic social et natif.",
  },
];

const SITE_BY_SLUG = new Map(PROMO_SITES.map((s) => [s.slug, s]));

/** Look up a site by slug; undefined if it was removed from the catalogue. */
export function getPromoSite(slug: string): PromoSite | undefined {
  return SITE_BY_SLUG.get(slug);
}

/** Display name for a slug, falling back to the raw slug for retired entries. */
export function promoSiteName(slug: string): string {
  return SITE_BY_SLUG.get(slug)?.name ?? slug;
}
