import { z } from "zod";

/**
 * What the pages generated for affiliates say about the offer behind their
 * button. Every field is required, and none has a default: the visitor is
 * about to hand over an address and a card, so the page must be able to say
 * what they get, what it costs, whether it recurs and who bills them. A page
 * that cannot say it is not generated.
 */
const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(2, `${label} : à remplir`)
    .max(max, `${label} : ${max} caractères au plus`);

export const siteOfferSchema = z.object({
  trackingUrl: z
    .string()
    .trim()
    .url("Lien de l'offre invalide")
    .refine((u) => u.startsWith("https://"), "Le lien doit commencer par https://"),
  productName: text("Nom de l'offre", 80),
  summary: text("Ce que le visiteur obtient", 400),
  price: text("Prix demandé aujourd'hui", 60),
  recurring: text("Prélèvements suivants", 400),
  billedBy: text("Qui débite", 120),
  cancellation: text("Comment résilier", 400),
  companyName: text("Nom de la société", 120),
  contactEmail: z.string().trim().email("E-mail de contact invalide").max(200),
});

export type SiteOffer = z.infer<typeof siteOfferSchema>;

export const SITE_OFFER_KEY = "sites.offer";
