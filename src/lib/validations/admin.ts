import { z } from "zod";

export const userStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "BANNED"]),
});

export const publisherApplicationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const offerStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "ACTIVE", "PAUSED", "ARCHIVED"]),
});

export const paymentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]),
});

// A payout the admin has already sent, recorded after the fact. The date is
// theirs to set, because the money may have left days before anyone opened the
// panel — defaulting it to "now" would quietly misdate the books.
export const recordPayoutSchema = z.object({
  amount: z
    .number()
    .positive("Le montant doit être supérieur à 0")
    .max(1_000_000, "Montant invalide"),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  method: z.enum(["PAYPAL", "BANK_WIRE", "CRYPTO", "PAYONEER", "OTHER"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const commissionStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]),
});

export const permissionGrantSchema = z.object({
  permissionKey: z.string().min(1),
  grant: z.boolean(),
});

// One setting, because it is the only one anything reads. The form used to
// carry a site name, a support address, a cookie lifetime and a maintenance
// switch that were saved and then consulted by nothing — a switch labelled
// "maintenance" that leaves the site up is worse than no switch.
export const platformSettingsSchema = z.object({
  minPayout: z.number().min(0).max(100_000),
});

export const dailyStatSchema = z.object({
  publisherId: z.string().min(1),
  // Sent as "yyyy-MM-dd" from the date input; normalized to UTC midnight server-side.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  clicks: z.number().int().min(0),
  hosts: z.number().int().min(0),
  conversions: z.number().int().min(0),
  revenue: z.number().min(0),
});

export const dailyStatUpdateSchema = dailyStatSchema
  .omit({ publisherId: true, date: true })
  .partial();

// Offers the network runs itself, created straight from the admin panel
// (no advertiser account involved). Deliberately lighter than the advertiser
// form: the rest of the fields keep their schema defaults.
export const adminOfferSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(150),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  payout: z.number().min(0).max(100_000),
  payoutType: z.enum(["CPA", "CPL", "CPS", "REVSHARE"]),
  // Empty means "link not decided yet"; a placeholder is stored instead.
  landingUrl: z
    .string()
    .trim()
    .url("URL invalide")
    .optional()
    .or(z.literal("")),
});

export const adminOfferUpdateSchema = z.object({
  landingUrl: z.string().trim().url("URL invalide"),
});

export const trainingVideoSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  url: z.string().trim().url("Lien invalide").max(2000),
  position: z.number().int().min(0).max(999).optional(),
});

export const trainingVideoUpdateSchema = z.object({
  active: z.boolean(),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court").max(120),
  body: z.string().trim().min(5, "Message trop court").max(4000),
});

export const announcementUpdateSchema = z.object({
  active: z.boolean(),
});

export const siteRequestStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const deliverLinkSchema = z.object({
  // The real affiliate URL (the advertiser's tracker) the admin pastes.
  targetUrl: z.string().trim().url("URL invalide").max(2000),
});

export const postbackTokenSchema = z.object({
  publisherId: z.string().min(1),
  // The sub3 an affiliate carries in their traffic. Lower-cased on both sides
  // so a network that echoes "Slime" still finds the affiliate who set
  // "slime"; dots, dashes and underscores because networks use all three.
  token: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Trois caractères au minimum")
    .max(40, "Quarante caractères au maximum")
    .regex(
      /^[a-z0-9._-]+$/,
      "Lettres, chiffres, point, tiret et tiret bas uniquement",
    ),
});
