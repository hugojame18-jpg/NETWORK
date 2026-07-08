import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/auth-header";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Créer un compte" };

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;

  return (
    <div>
      <AuthHeader title="Rejoindre RevNetwork" description="Créez votre compte en moins de deux minutes." />
      <SignUpForm referralCode={ref?.trim().toUpperCase() || undefined} />
    </div>
  );
}
