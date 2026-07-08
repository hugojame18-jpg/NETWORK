import type { Metadata } from "next";
import { getSetting } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformSettingsForm } from "@/components/dashboard/admin/platform-settings-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = { title: "Paramètres" };

interface PlatformSettingsValue {
  siteName: string;
  supportEmail: string;
  defaultCookieDays: number;
  minPayout: number;
  maintenanceMode: boolean;
}

const DEFAULTS: PlatformSettingsValue = {
  siteName: "RevNetwork",
  supportEmail: "support@ccsubmit.io",
  defaultCookieDays: 30,
  minPayout: 50,
  maintenanceMode: false,
};

export default async function AdminSettingsPage() {
  const setting = await getSetting("platform");
  const value = { ...DEFAULTS, ...(setting?.value as Partial<PlatformSettingsValue> | undefined) };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Paramètres de la plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformSettingsForm {...value} />
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Sécurité de votre compte</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
