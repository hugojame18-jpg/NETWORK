import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getPayments } from "@/lib/data/publisher";
import { getAffiliateLedger } from "@/lib/data/ledger";
import { paymentMethodLabel } from "@/lib/payment-methods";
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
import { RequestPaymentForm } from "@/components/dashboard/request-payment-form";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Paiements" };

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  PENDING: { label: "En attente", variant: "secondary" },
  APPROVED: { label: "Validé", variant: "default" },
  PAID: { label: "Payé", variant: "default" },
  REJECTED: { label: "Refusé", variant: "destructive" },
};

export default async function PaymentsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  // The balance is derived from the stats and the payouts actually recorded —
  // the same figure the admin sees on this affiliate's file, so the two sides
  // can never quote each other different numbers.
  const [payments, ledger] = await Promise.all([
    getPayments(publisher.id),
    getAffiliateLedger(publisher.id),
  ]);
  const available = ledger.available;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Ton solde et l'historique de tes retraits. Les demandes sont traitées sous quelques jours ouvrés."
      />

      {/* The balance is the only figure anyone opens this page for. */}
      <div className="surface-brand flex flex-wrap items-end justify-between gap-5 p-6">
        <div>
          <p className="eyebrow">Solde disponible</p>
          <p className="num mt-2.5 text-[38px] leading-none font-semibold">
            {formatCurrency(available)}
          </p>
          <p className="mt-2.5 text-xs text-muted-foreground">
            Minimum de retrait&nbsp;:{" "}
            {formatCurrency(toNumber(publisher.minPayout))}
            {ledger.pending > 0 && (
              <>
                {" · "}
                {formatCurrency(ledger.pending)} déjà en cours de traitement
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrency(ledger.earned)} gagnés depuis le début, dont{" "}
            {formatCurrency(ledger.paid)} déjà versés.
          </p>
        </div>
        <RequestPaymentForm
          available={available}
          minPayout={toNumber(publisher.minPayout)}
          defaultMethod={publisher.paymentMethod}
        />
      </div>

      <Card>
        <CardContent className="px-0">
          {payments.length === 0 ? (
            <EmptyState
              icon={<Wallet />}
              title="Aucun retrait pour l'instant"
              description="Dès que ton solde atteint le minimum, demande ton paiement : il apparaîtra ici avec son statut."
            />
          ) : (
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
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.requestedAt)}
                    </TableCell>
                    <TableCell className="num font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabel(payment.method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_LABELS[payment.status].variant}>
                        {STATUS_LABELS[payment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
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
