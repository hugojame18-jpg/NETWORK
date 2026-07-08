import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getSpendByOffer, getTopPublishers } from "@/lib/data/advertiser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Statistiques" };

export default async function AdvertiserStatsPage() {
  const user = await requireRole("ADVERTISER");
  const advertiser = await getAdvertiserByUserId(user.id);

  const [byOffer, topPublishers] = await Promise.all([
    getSpendByOffer(advertiser.id),
    getTopPublishers(advertiser.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Dépenses par offre</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Taux</TableHead>
                <TableHead className="text-right">Dépensé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byOffer.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell className="text-right">{offer.clicks}</TableCell>
                  <TableCell className="text-right">{offer.conversions}</TableCell>
                  <TableCell className="text-right">
                    {offer.clicks > 0 ? `${((offer.conversions / offer.clicks) * 100).toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(offer.spend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {byOffer.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune offre pour le moment.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Publishers les plus performants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Dépensé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPublishers.map((p) => (
                <TableRow key={p.publisherId}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">{p.conversions}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(p.spend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {topPublishers.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune conversion pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
