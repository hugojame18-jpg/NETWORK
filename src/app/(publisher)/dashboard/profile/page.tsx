import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId } from "@/lib/data/publisher";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditProfileForm } from "@/components/dashboard/edit-profile-form";
import { PaymentMethodForm } from "@/components/dashboard/payment-method-form";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Profil" };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function ProfilePage() {
  const authUser = await requireRole("PUBLISHER");
  const [user, publisher] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: authUser.id } }),
    getPublisherByUserId(authUser.id),
  ]);

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
            <p className="mt-1 font-mono text-xs text-muted-foreground">ID affilié&nbsp;: #{publisher.memberId}</p>
            <div className="mt-2 flex gap-2">
              <Badge>Publisher</Badge>
              <Badge variant={publisher.applicationStatus === "APPROVED" ? "default" : "secondary"}>
                {publisher.applicationStatus === "APPROVED" ? "Compte approuvé" : "En attente d'approbation"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProfileForm
            name={user.name}
            companyName={publisher.companyName ?? ""}
            website={publisher.website ?? ""}
          />
        </CardContent>
      </Card>

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
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Solde actuel</p>
            <p className="text-lg font-semibold">{formatCurrency(publisher.balance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total gagné</p>
            <p className="text-lg font-semibold">{formatCurrency(publisher.totalEarned)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
