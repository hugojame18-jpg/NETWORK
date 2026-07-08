import type { Metadata } from "next";
import { getCampaignsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Campagnes" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  DRAFT: "secondary",
  PAUSED: "secondary",
  ENDED: "destructive",
};

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaignsAdminList();

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campagne</TableHead>
              <TableHead>Annonceur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Offres</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Dépensé</TableHead>
              <TableHead>Créée le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.advertiser.companyName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[campaign.status]}>{campaign.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{campaign._count.offers}</TableCell>
                <TableCell className="text-right">{campaign.budget ? formatCurrency(campaign.budget) : "—"}</TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.spent)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(campaign.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {campaigns.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucune campagne pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
