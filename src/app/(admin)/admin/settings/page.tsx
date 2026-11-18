import type { Metadata } from "next";
import { getSetting } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSettingsForm } from "@/components/dashboard/admin/platform-settings-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const setting = await getSetting("platform");
  const stored = (setting?.value as { minPayout?: unknown } | undefined)
    ?.minPayout;
  const minPayout = typeof stored === "number" ? stored : 50;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Paramètres"
        description="Le seuil de retrait du réseau et la sécurité de ton compte."
      />

      <Card>
        <CardHeader>
          <CardTitle>Retraits</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformSettingsForm minPayout={minPayout} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité de ton compte</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
