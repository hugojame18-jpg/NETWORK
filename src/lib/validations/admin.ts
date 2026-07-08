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

export const commissionStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]),
});

export const permissionGrantSchema = z.object({
  permissionKey: z.string().min(1),
  grant: z.boolean(),
});

export const platformSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100),
  supportEmail: z.string().trim().email(),
  defaultCookieDays: z.number().int().min(1).max(365),
  minPayout: z.number().positive(),
  maintenanceMode: z.boolean(),
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

export const dailyStatUpdateSchema = dailyStatSchema.omit({ publisherId: true, date: true }).partial();
