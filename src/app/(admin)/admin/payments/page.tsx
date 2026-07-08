import type { Metadata } from "next";
import { getPaymentsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusMenu } from "@/components/dashboard/admin/payment-status-menu";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Paiements" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  PAID: "default",
  REJECTED: "destructive",
};

export default async function AdminPaymentsPage() {
  const payments = await getPaymentsAdminList();

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
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
                  <p className="font-medium">{payment.publisher.companyName ?? payment.publisher.user.name}</p>
                  <p className="text-xs text-muted-foreground">{payment.publisher.user.email}</p>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.method.replace("_", " ")}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[payment.status]}>{payment.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(payment.requestedAt)}</TableCell>
                <TableCell className="text-muted-foreground">{payment.paidAt ? formatDate(payment.paidAt) : "—"}</TableCell>
                <TableCell>
                  <PaymentStatusMenu paymentId={payment.id} currentStatus={payment.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {payments.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucun paiement pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
