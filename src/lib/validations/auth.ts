import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Adresse email invalide");

export const passwordSchema = z
  .string()
  .min(8, "8 caractères minimum")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/[0-9]/, "Doit contenir un chiffre");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "2 caractères minimum").max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["PUBLISHER", "ADVERTISER"]),
    companyName: z.string().trim().max(150).optional(),
    website: z.string().trim().url("URL invalide").optional().or(z.literal("")),
    referralCode: z.string().trim().max(32).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
