import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/auth-header";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Connexion" };

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string; code?: string; verified?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <div>
      <AuthHeader title="Bon retour" description="Connectez-vous pour accéder à votre espace." />
      <SignInForm
        callbackUrl={params.callbackUrl ?? "/dashboard"}
        errorCode={params.code ?? params.error}
        verifiedNotice={params.verified}
      />
    </div>
  );
}
