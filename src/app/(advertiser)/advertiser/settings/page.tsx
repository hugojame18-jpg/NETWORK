import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = { title: "Paramètres" };

export default async function AdvertiserSettingsPage() {
  await requireRole("ADVERTISER");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
