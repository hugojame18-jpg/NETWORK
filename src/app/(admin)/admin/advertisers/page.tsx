import type { Metadata } from "next";
import { getAdvertisersAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Annonceurs" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  SUSPENDED: "secondary",
  BANNED: "destructive",
};

export default async function AdminAdvertisersPage() {
  const advertisers = await getAdvertisersAdminList();

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Campagnes</TableHead>
              <TableHead className="text-right">Offres</TableHead>
              <TableHead className="text-right">Dépensé</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.map((advertiser) => (
              <TableRow key={advertiser.id}>
                <TableCell className="font-medium">{advertiser.companyName}</TableCell>
                <TableCell>
                  <p className="text-sm">{advertiser.user.name}</p>
                  <p className="text-xs text-muted-foreground">{advertiser.user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[advertiser.user.status]}>{advertiser.user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{advertiser._count.campaigns}</TableCell>
                <TableCell className="text-right">{advertiser._count.offers}</TableCell>
                <TableCell className="text-right">{formatCurrency(advertiser.totalSpent)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(advertiser.createdAt)}</TableCell>
                <TableCell>
                  <UserStatusMenu userId={advertiser.userId} currentStatus={advertiser.user.status} userLabel={advertiser.companyName} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {advertisers.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucun annonceur pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
