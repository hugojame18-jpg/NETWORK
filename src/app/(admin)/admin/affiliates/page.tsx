import type { Metadata } from "next";
import { getPublishersAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { ApplicationStatusActions } from "@/components/dashboard/admin/application-status-actions";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Affiliés" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  SUSPENDED: "secondary",
  BANNED: "destructive",
};

const APPLICATION_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

export default async function AdminAffiliatesPage() {
  const publishers = await getPublishersAdminList();

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publisher</TableHead>
              <TableHead>Candidature</TableHead>
              <TableHead>Statut compte</TableHead>
              <TableHead className="text-right">Solde</TableHead>
              <TableHead className="text-right">Total gagné</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((publisher) => (
              <TableRow key={publisher.id}>
                <TableCell>
                  <p className="font-medium">{publisher.user.name}</p>
                  <p className="text-xs text-muted-foreground">{publisher.user.email}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={APPLICATION_VARIANT[publisher.applicationStatus]}>{publisher.applicationStatus}</Badge>
                    {publisher.applicationStatus === "PENDING" && <ApplicationStatusActions publisherId={publisher.id} />}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[publisher.user.status]}>{publisher.user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(publisher.balance)}</TableCell>
                <TableCell className="text-right">{formatCurrency(publisher.totalEarned)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(publisher.createdAt)}</TableCell>
                <TableCell>
                  <UserStatusMenu userId={publisher.userId} currentStatus={publisher.user.status} userLabel={publisher.user.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {publishers.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucun publisher pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
