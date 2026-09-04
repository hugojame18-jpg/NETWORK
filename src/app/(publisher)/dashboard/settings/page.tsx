import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId } from "@/lib/data/publisher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PaymentMethodForm } from "@/components/dashboard/payment-method-form";
import { ReplayTourButton } from "@/components/dashboard/replay-tour-button";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Méthode de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm
            method={publisher.paymentMethod ?? "PAYPAL"}
            details={(publisher.paymentDetails as Record<string, string>) ?? {}}
          />
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Prise en main</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Rejoue le guide pas-à-pas qui explique comment demander un lien, suivre tes statistiques et être payé.
          </p>
          <ReplayTourButton />
        </CardContent>
      </Card>
    </div>
  );
}
