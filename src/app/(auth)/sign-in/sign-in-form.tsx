"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

const ERROR_MESSAGES: Record<string, string> = {
  account_suspended: "Votre compte a été suspendu. Contactez le support pour plus d'informations.",
  account_banned: "Votre compte a été banni de la plateforme.",
  CredentialsSignin: "Email ou mot de passe incorrect.",
};

const NOTICE_MESSAGES: Record<string, string> = {
  success: "Adresse email confirmée. Vous pouvez vous connecter.",
  expired: "Ce lien de confirmation a expiré. Reconnectez-vous puis redemandez un email.",
  missing: "Lien de confirmation invalide.",
};

interface SignInFormProps {
  callbackUrl: string;
  errorCode?: string;
  verifiedNotice?: string;
}

export function SignInForm({ callbackUrl, errorCode, verifiedNotice }: SignInFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "Une erreur est survenue.") : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = (data: SignInInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        const key = result.code ?? result.error;
        setFormError(ERROR_MESSAGES[key] ?? ERROR_MESSAGES.CredentialsSignin);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {verifiedNotice && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {NOTICE_MESSAGES[verifiedNotice] ?? verifiedNotice}
        </div>
      )}
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Mot de passe oublié ?
          </Link>
        </div>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Se connecter
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/sign-up" className="font-medium text-foreground hover:underline">
          Créer un compte
        </Link>
      </p>
    </motion.form>
  );
}
