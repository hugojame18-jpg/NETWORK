import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeader } from "@/components/shared/auth-header";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div>
        <AuthHeader title="Lien invalide" description="Ce lien de réinitialisation est manquant ou incomplet." />
        <Link href="/forgot-password" className="text-sm font-medium hover:underline">
          Redemander un lien
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader title="Nouveau mot de passe" description="Choisissez un mot de passe robuste." />
      <ResetPasswordForm token={token} />
    </div>
  );
}
