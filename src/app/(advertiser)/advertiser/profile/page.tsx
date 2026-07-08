import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getSpendSummary } from "@/lib/data/advertiser";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditAdvertiserProfileForm } from "@/components/dashboard/edit-advertiser-profile-form";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Profil" };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function AdvertiserProfilePage() {
  const authUser = await requireRole("ADVERTISER");
  const [user, advertiser] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: authUser.id } }),
    getAdvertiserByUserId(authUser.id),
  ]);
  const summary = await getSpendSummary(advertiser.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="shadow-premium">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-2">Advertiser</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <EditAdvertiserProfileForm name={user.name} companyName={advertiser.companyName} website={advertiser.website ?? ""} />
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Dépensé ce mois</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.month)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dépensé au total</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.total)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
