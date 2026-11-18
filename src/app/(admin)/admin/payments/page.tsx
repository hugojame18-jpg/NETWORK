import type { Metadata } from "next";
import { getPaymentsAdminList } from "@/lib/data/admin";
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
import { PaymentStatusMenu } from "@/components/dashboard/admin/payment-status-menu";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Paiements" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    PENDING: "secondary",
    APPROVED: "default",
    PAID: "default",
    REJECTED: "destructive",
  };

export default async function AdminPaymentsPage() {
  const payments = await getPaymentsAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Les demandes de retrait de tes affiliés, à valider puis à marquer comme payées."
      />

      <Card>
        <CardContent className="px-0">
          {payments.length === 0 ? (
            <EmptyState
              icon={<Wallet />}
              title="Aucune demande de paiement"
              description="Quand un affilié atteint le minimum de retrait, sa demande arrive ici."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Demandé le</TableHead>
                  <TableHead>Payé le</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <p className="font-medium">
                        {payment.publisher.companyName ??
                          payment.publisher.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.publisher.user.email}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabel(payment.method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.requestedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusMenu
                        paymentId={payment.id}
                        currentStatus={payment.status}
                      />
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
