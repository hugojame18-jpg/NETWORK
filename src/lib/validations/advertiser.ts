import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  budget: z.number().positive().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]),
});

export const offerSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(2000),
  category: z.string().trim().min(2).max(60),
  payout: z.number().positive().max(100_000),
  payoutType: z.enum(["CPA", "CPL", "CPS", "REVSHARE"]),
  countries: z.array(z.string().trim().length(2)),
  devices: z.array(z.enum(["DESKTOP", "MOBILE", "TABLET", "ALL"])).min(1),
  restrictions: z.string().trim().max(1000).optional().or(z.literal("")),
  landingUrl: z.string().trim().url(),
  previewUrl: z.string().trim().url().optional().or(z.literal("")),
  creativeUrl: z.string().trim().url().optional().or(z.literal("")),
  cookieDays: z.number().int().min(1).max(365),
  dailyCap: z.number().int().positive().optional().nullable(),
  campaignId: z.string().optional().or(z.literal("")),
});

export const updateAdvertiserProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(150),
  website: z.string().trim().url().optional().or(z.literal("")),
});
