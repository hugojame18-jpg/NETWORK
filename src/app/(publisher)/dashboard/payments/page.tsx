import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getPayments, getPendingCommissionsTotal } from "@/lib/data/publisher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RequestPaymentForm } from "@/components/dashboard/request-payment-form";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Paiements" };

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  APPROVED: { label: "Validé", variant: "default" },
  PAID: { label: "Payé", variant: "default" },
  REJECTED: { label: "Refusé", variant: "destructive" },
};

export default async function PaymentsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [payments, available] = await Promise.all([
    getPayments(publisher.id),
    getPendingCommissionsTotal(publisher.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="shadow-premium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Solde disponible</CardTitle>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(available)}</p>
          </div>
          <RequestPaymentForm
            available={available}
            minPayout={toNumber(publisher.minPayout)}
            defaultMethod={publisher.paymentMethod}
          />
        </CardHeader>
      </Card>

      <Card className="shadow-premium">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date de demande</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Payé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">{formatDate(payment.requestedAt)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.method.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_LABELS[payment.status].variant}>{STATUS_LABELS[payment.status].label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.paidAt ? formatDate(payment.paidAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payments.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucun paiement pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
