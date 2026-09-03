"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Megaphone, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

const ROLE_OPTIONS = [
  {
    value: "PUBLISHER" as const,
    label: "Publisher",
    description: "Je génère du trafic et je monétise mon audience.",
    icon: Users,
  },
  {
    value: "ADVERTISER" as const,
    label: "Advertiser",
    description: "Je diffuse des offres et je recrute des affiliés.",
    icon: Megaphone,
  },
];

export function SignUpForm({ referralCode }: { referralCode?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "PUBLISHER" },
  });

  const role = watch("role");
  const workedWithNetworks = watch("workedWithNetworks");

  const onSubmit = (data: SignUpInput) => {
    setFormError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, referralCode }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? "Une erreur est survenue.");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/sign-in?verified=success");
        return;
      }

      router.push(data.role === "ADVERTISER" ? "/advertiser" : "/dashboard");
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
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      )}

      {referralCode && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <Gift className="h-4 w-4 shrink-0" />
          <span>
            Vous êtes parrainé avec le code <span className="font-semibold tracking-wide">{referralCode}</span>.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setValue("role", option.value, { shouldValidate: true })}
            className={cn(
              "hover-lift rounded-xl border p-3 text-left transition-colors",
              role === option.value
                ? "border-primary bg-accent"
                : "border-border bg-card hover:bg-accent/50",
            )}
          >
            <option.icon className="mb-2 h-4 w-4 text-primary" />
            <p className="text-sm font-medium">{option.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">{role === "ADVERTISER" ? "Nom de l'entreprise" : "Société (optionnel)"}</Label>
        <Input id="companyName" autoComplete="organization" placeholder="Acme Inc." {...register("companyName")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmation</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Publisher applications are reviewed by hand, so we collect what an
          admin needs to make that call. Advertisers skip all of this. */}
      {role === "PUBLISHER" && (
        <div className="space-y-5 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium">Ta candidature</p>

          <div className="space-y-2">
            <Label>As-tu déjà travaillé avec d&apos;autres réseaux d&apos;affiliation&nbsp;?</Label>
            <div className="flex gap-2">
              {[
                { value: true, label: "Oui" },
                { value: false, label: "Non" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setValue("workedWithNetworks", option.value, { shouldValidate: true })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm transition",
                    workedWithNetworks === option.value
                      ? "border-primary bg-primary/10 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {workedWithNetworks === true && (
            <div className="space-y-2">
              <Label htmlFor="previousNetworks">Lesquels&nbsp;?</Label>
              <Input id="previousNetworks" placeholder="Ex. CrakRevenue, Mobidea…" {...register("previousNetworks")} />
              {errors.previousNetworks && (
                <p className="text-xs text-destructive">{errors.previousNetworks.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="affiliateExperience">Parle-nous de ton activité en affiliation</Label>
            <Textarea
              id="affiliateExperience"
              rows={3}
              placeholder="Depuis combien de temps, quelles verticales, quels volumes…"
              {...register("affiliateExperience")}
            />
            {errors.affiliateExperience && (
              <p className="text-xs text-destructive">{errors.affiliateExperience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokLinks">Tes posts / comptes TikTok</Label>
            <Textarea
              id="tiktokLinks"
              rows={2}
              placeholder="@moncompte, https://tiktok.com/@moncompte/video/..."
              {...register("tiktokLinks")}
            />
            {errors.tiktokLinks && <p className="text-xs text-destructive">{errors.tiktokLinks.message}</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            Ta candidature sera examinée manuellement. Tu recevras une réponse dès qu&apos;elle est traitée.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {role === "PUBLISHER" ? "Envoyer ma candidature" : "Créer mon compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Se connecter
        </Link>
      </p>
    </motion.form>
  );
}
