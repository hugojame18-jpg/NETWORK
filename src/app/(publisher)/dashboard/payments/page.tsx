import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getPayments } from "@/lib/data/publisher";
import { getAffiliateLedger } from "@/lib/data/ledger";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { progressToward } from "@/lib/trend";
import { RequestPaymentForm } from "@/components/dashboard/request-payment-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Money,
  PaymentStatus,
  ProgressBar,
  Section,
} from "@/components/dashboard/kit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Paiements" };

// A payout recorded a moment ago has to show on the next refresh.
export const dynamic = "force-dynamic";

/** How the affiliate's own payment details are labelled back to them. */
const DETAIL_LABELS: Record<string, string> = {
  email: "Adresse",
  iban: "IBAN",
  wallet: "Wallet",
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

  const minPayout = toNumber(publisher.minPayout);
  const canRequest = ledger.available >= minPayout && minPayout > 0;
  const missing = Math.max(0, minPayout - ledger.available);

  const details = Object.entries(
    (publisher.paymentDetails as Record<string, string> | null) ?? {},
  ).filter(([, value]) => typeof value === "string" && value.trim() !== "");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Ce que tu peux retirer, où on te l'envoie, et tout ce qui t'a déjà été versé."
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="surface-brand flex flex-col p-6 lg:col-span-5">
          <p className="eyebrow">Solde disponible</p>
          <p className="mt-3 text-[44px] leading-none font-semibold tracking-tight">
            <Money value={ledger.available} />
          </p>

          <div className="mt-6">
            <ProgressBar value={progressToward(ledger.available, minPayout)} />
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              {canRequest ? (
                <span className="font-medium text-success">
                  Tu as atteint le minimum de retrait de{" "}
                  <span className="num">{formatCurrency(minPayout)}</span>.
                </span>
              ) : (
                <>
                  Encore{" "}
                  <span className="num font-medium text-foreground">
                    {formatCurrency(missing)}
                  </span>{" "}
                  avant le minimum de retrait de{" "}
                  <span className="num">{formatCurrency(minPayout)}</span>.
                </>
              )}
            </p>
          </div>

          <div className="mt-auto pt-6">
            <RequestPaymentForm
              available={ledger.available}
              minPayout={minPayout}
              defaultMethod={publisher.paymentMethod}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface p-5">
              <p className="eyebrow">Gagné au total</p>
              <p className="mt-3 text-2xl leading-none font-semibold tracking-tight">
                <Money value={ledger.earned} />
              </p>
              {/* Only when there is something beyond the traffic itself, so
                  the line explains a total rather than decorating it. */}
              {(ledger.referralEarnings > 0 || ledger.tierBonus > 0) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  dont{" "}
                  {[
                    ledger.referralEarnings > 0 &&
                      `${formatCurrency(ledger.referralEarnings)} de parrainage`,
                    ledger.tierBonus > 0 &&
                      `${formatCurrency(ledger.tierBonus)} de bonus de palier`,
                  ]
                    .filter(Boolean)
                    .join(" et ")}
                </p>
              )}
            </div>
            <div className="surface p-5">
              <p className="eyebrow">Déjà versé</p>
              <p className="mt-3 text-2xl leading-none font-semibold tracking-tight">
                <Money value={ledger.paid} />
              </p>
            </div>
            <div className="surface p-5">
              <p className="eyebrow">En cours de traitement</p>
              <p className="mt-3 text-2xl leading-none font-semibold tracking-tight">
                <Money value={ledger.pending} />
              </p>
            </div>
          </div>

          <Section
            title="Où on te paie"
            action={
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {details.length > 0 ? "Modifier" : "Renseigner"}
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {details.length > 0 ? (
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">Moyen</dt>
                  <dd className="font-medium">
                    {paymentMethodLabel(publisher.paymentMethod)}
                  </dd>
                </div>
                {details.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-muted-foreground">
                      {DETAIL_LABELS[key] ?? key}
                    </dt>
                    <dd className="font-mono text-xs break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tu n&apos;as pas encore indiqué où t&apos;envoyer ton argent.
                Sans ça, on ne peut pas te payer — c&apos;est une minute dans
                ton profil.
              </p>
            )}
          </Section>
        </div>
      </div>

      <Section
        title="Historique"
        description="Chaque versement, avec sa date et sa référence."
        flush
      >
        {payments.length === 0 ? (
          <EmptyState
            icon={<Wallet />}
            title="Aucun versement pour l'instant"
            description="Dès qu'un paiement t'est envoyé, il apparaît ici avec son moyen et sa référence."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Date</TableHead>
                <TableHead>Moyen</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="pr-5 text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-5 font-medium">
                    {formatDate(payment.paidAt ?? payment.requestedAt)}
                  </TableCell>
                  <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-muted-foreground">
                    {payment.note ?? "—"}
                  </TableCell>
                  <TableCell>
                    <PaymentStatus status={payment.status} />
                  </TableCell>
                  <TableCell className="num pr-5 text-right font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}
