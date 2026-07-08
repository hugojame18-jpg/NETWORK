import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getAdvertiserOffers, getCampaigns } from "@/lib/data/advertiser";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OfferFormDialog, type OfferFormValues } from "@/components/dashboard/offer-form-dialog";
import { formatCurrency, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Offres" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  DRAFT: "secondary",
  PAUSED: "secondary",
  ARCHIVED: "destructive",
};

export default async function AdvertiserOffersPage() {
  const user = await requireRole("ADVERTISER");
  const advertiser = await getAdvertiserByUserId(user.id);
  const [offers, campaigns] = await Promise.all([
    getAdvertiserOffers(advertiser.id),
    getCampaigns(advertiser.id),
  ]);

  const campaignOptions = campaigns.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <OfferFormDialog campaigns={campaignOptions} />
      </div>

      <Card className="shadow-premium">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => {
                const formValues: OfferFormValues = {
                  id: offer.id,
                  name: offer.name,
                  description: offer.description,
                  category: offer.category,
                  payout: toNumber(offer.payout).toString(),
                  payoutType: offer.payoutType,
                  countries: offer.countries.join(", "),
                  devices: offer.devices,
                  restrictions: offer.restrictions ?? "",
                  landingUrl: offer.landingUrl,
                  previewUrl: offer.previewUrl ?? "",
                  creativeUrl: offer.creativeUrl ?? "",
                  cookieDays: offer.cookieDays.toString(),
                  dailyCap: offer.dailyCap?.toString() ?? "",
                  campaignId: offer.campaignId ?? "",
                };

                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>{offer.category}</TableCell>
                    <TableCell>{formatCurrency(offer.payout)}</TableCell>
                    <TableCell className="text-right">{offer._count.affiliateLinks}</TableCell>
                    <TableCell className="text-right">{offer._count.conversions}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[offer.status]}>{offer.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <OfferFormDialog offer={formValues} campaigns={campaignOptions} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {offers.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Vous n&apos;avez pas encore créé d&apos;offre.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
