import { z } from "zod";

export const generateLinkSchema = z.object({
  offerId: z.string().min(1),
  label: z.string().trim().max(120).optional(),
});

export const requestSiteSchema = z.object({
  // Slug from the PROMO_SITES catalogue; existence is checked server-side.
  siteSlug: z.string().trim().min(1).max(60),
});

export const requestPaymentSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  method: z.enum(["PAYPAL", "BANK_WIRE", "CRYPTO", "PAYONEER"]),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: z.string().trim().max(150).optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
});

export const updatePaymentMethodSchema = z.object({
  paymentMethod: z.enum(["PAYPAL", "BANK_WIRE", "CRYPTO", "PAYONEER"]),
  paymentDetails: z.record(z.string(), z.string()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Generated sites
// ---------------------------------------------------------------------------

const headline = z
  .string()
  .trim()
  .min(4, "Titre trop court")
  .max(90, "Titre : 90 caractères au plus");

export const createSiteSchema = z.object({
  name: z.string().trim().min(2, "Donne un nom à ton site").max(60),
  headline,
});

export const updateSiteSchema = z.object({ headline });

// A bare host name, no scheme, no path: it is handed to Netlify as it is.
export const siteDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/,
      "Domaine invalide (exemple : monsite.site)",
    ),
});
