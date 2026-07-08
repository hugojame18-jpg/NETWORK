import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/shared/sign-out-button";

export const metadata: Metadata = { title: "Compte restreint" };

export default async function AccountRestrictedPage() {
  const session = await auth();
  const status = session?.user.status;

  const message =
    status === "BANNED"
      ? "Votre compte a été banni de la plateforme suite à une violation de nos conditions d'utilisation."
      : "Votre compte a été suspendu temporairement. Contactez le support pour en savoir plus.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="glass shadow-premium max-w-md space-y-4 rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">Accès restreint</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-sm">
          <a href="mailto:support@ccsubmit.io" className="font-medium hover:underline">
            support@ccsubmit.io
          </a>
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
