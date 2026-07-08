import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/auth-header";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <AuthHeader
        title="Mot de passe oublié"
        description="Entrez votre email, nous vous envoyons un lien de réinitialisation."
      />
      <ForgotPasswordForm />
    </div>
  );
}
