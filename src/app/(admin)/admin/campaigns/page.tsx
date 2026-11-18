import type { Metadata } from "next";
import { getCampaignsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Megaphone } from "lucide-react";

export const metadata: Metadata = { title: "Campagnes" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    DRAFT: "secondary",
    PAUSED: "secondary",
    ENDED: "destructive",
  };

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaignsAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campagnes"
        description="Les campagnes rattachées à tes annonceurs."
      />

      <Card>
        <CardContent className="px-0">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone />}
              title="Aucune campagne"
              description="Crée une campagne pour regrouper plusieurs offres d'un même annonceur."
            />
          ) : (
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
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>{campaign.advertiser.companyName}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign._count.offers}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.budget ? formatCurrency(campaign.budget) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.spent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(campaign.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
