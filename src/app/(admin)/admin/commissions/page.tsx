import type { Metadata } from "next";
import { getCommissionsAdminList } from "@/lib/data/admin";
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
import { CommissionStatusMenu } from "@/components/dashboard/admin/commission-status-menu";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Coins } from "lucide-react";

export const metadata: Metadata = { title: "Commissions" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    PENDING: "secondary",
    APPROVED: "default",
    PAID: "default",
    REJECTED: "destructive",
  };

export default async function AdminCommissionsPage() {
  const commissions = await getCommissionsAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commissions"
        description="Le détail de ce que chaque affilié a généré."
      />

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    {commission.publisher.companyName ??
                      commission.publisher.user.name}
                  </TableCell>
                  <TableCell>{commission.conversion.offer.name}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(commission.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[commission.status]}>
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(commission.createdAt)}
                  </TableCell>
                  <TableCell>
                    <CommissionStatusMenu
                      commissionId={commission.id}
                      currentStatus={commission.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {commissions.length === 0 && (
            <EmptyState
              icon={<Coins />}
              title="Aucune commission"
              description="Les commissions apparaîtront ici au fil des conversions."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
