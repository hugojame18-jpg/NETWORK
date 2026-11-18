import type { Metadata } from "next";
import { getOffersAdminList } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OfferStatusMenu } from "@/components/dashboard/admin/offer-status-menu";
import { OfferComposer } from "@/components/dashboard/admin/offer-composer";
import { OfferLandingForm } from "@/components/dashboard/admin/offer-landing-form";
import { formatCurrency } from "@/lib/format";
import { verticalIcon, verticalLabel } from "@/lib/verticals";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Layers } from "lucide-react";

export const metadata: Metadata = { title: "Offres" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    PENDING: "secondary",
    DRAFT: "secondary",
    PAUSED: "secondary",
    ARCHIVED: "destructive",
  };

/** Offers created from the admin before their real link is known. */
const PLACEHOLDER_LANDING_URL = "https://revnetwork.live/lien-a-venir";

export default async function AdminOffersPage() {
  const offers = await getOffersAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offres"
        description="Le catalogue que voient tes affiliés. Une offre en brouillon reste invisible pour eux."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle offre</CardTitle>
        </CardHeader>
        <CardContent>
          <OfferComposer />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead>Annonceur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Lien de l&apos;offre</TableHead>
                <TableHead className="text-right">Liens</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>{offer.advertiser.companyName}</TableCell>
                  <TableCell>
                    {verticalIcon(offer.category)}{" "}
                    {verticalLabel(offer.category)}
                  </TableCell>
                  <TableCell>{formatCurrency(offer.payout)}</TableCell>
                  <TableCell>
                    <OfferLandingForm
                      offerId={offer.id}
                      currentUrl={offer.landingUrl}
                      placeholder={offer.landingUrl === PLACEHOLDER_LANDING_URL}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {offer._count.affiliateLinks}
                  </TableCell>
                  <TableCell className="text-right">
                    {offer._count.conversions}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[offer.status]}>
                      {offer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <OfferStatusMenu
                      offerId={offer.id}
                      currentStatus={offer.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {offers.length === 0 && (
            <EmptyState
              icon={<Layers />}
              title="Aucune offre au catalogue"
              description="Crée ta première offre ci-dessus : elle apparaîtra immédiatement chez tes affiliés."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
