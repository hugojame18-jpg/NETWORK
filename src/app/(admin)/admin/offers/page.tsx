import type { Metadata } from "next";
import { getOffersAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OfferStatusMenu } from "@/components/dashboard/admin/offer-status-menu";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Offres" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  DRAFT: "secondary",
  PAUSED: "secondary",
  ARCHIVED: "destructive",
};

export default async function AdminOffersPage() {
  const offers = await getOffersAdminList();

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offre</TableHead>
              <TableHead>Annonceur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Payout</TableHead>
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
                <TableCell>{offer.category}</TableCell>
                <TableCell>{formatCurrency(offer.payout)}</TableCell>
                <TableCell className="text-right">{offer._count.affiliateLinks}</TableCell>
                <TableCell className="text-right">{offer._count.conversions}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[offer.status]}>{offer.status}</Badge>
                </TableCell>
                <TableCell>
                  <OfferStatusMenu offerId={offer.id} currentStatus={offer.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {offers.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucune offre pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
