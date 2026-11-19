import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Wallet } from "lucide-react";
import {
  getPaymentsAdminList,
  getPublishersAdminList,
} from "@/lib/data/admin";
import { getAffiliateLedgers } from "@/lib/data/ledger";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Money,
  PaymentStatus,
  Person,
  Section,
  StatTile,
} from "@/components/dashboard/kit";
import { RecordPayoutDialog } from "@/components/dashboard/admin/record-payout-dialog";
import { DeletePayoutButton } from "@/components/dashboard/admin/delete-payout-button";
import { PaymentStatusMenu } from "@/components/dashboard/admin/payment-status-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Paiements" };

// What is owed changes with every conversion and every payout.
export const dynamic = "force-dynamic";

/**
 * Three questions, top to bottom: who do I pay, who is asking, what did I
 * already send.
 *
 * It used to be a single table of withdrawal requests, which answers only the
 * second. Most payouts start from the first — the admin deciding to settle a
 * balance — so that list comes first, with the button right on the row.
 */
export default async function AdminPaymentsPage() {
  const [payments, publishers, ledgers] = await Promise.all([
    getPaymentsAdminList(),
    getPublishersAdminList(),
    getAffiliateLedgers(),
  ]);

  const owed = publishers
    .map((publisher) => ({
      publisher,
      ledger: ledgers.get(publisher.id),
    }))
    .filter((row) => row.ledger && row.ledger.balance > 0.005)
    .sort((a, b) => b.ledger!.balance - a.ledger!.balance);

  const open = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "APPROVED",
  );
  const settled = payments.filter(
    (payment) => payment.status === "PAID" || payment.status === "REJECTED",
  );

  const owedTotal = owed.reduce((sum, row) => sum + row.ledger!.balance, 0);
  const openTotal = open.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const paidTotal = settled
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Qui payer, qui a demandé un retrait, et tout ce que tu as déjà envoyé."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="À payer"
          value={<Money value={owedTotal} />}
          hint={
            owed.length === 0
              ? "personne n'attend d'argent"
              : `à ${formatNumber(owed.length)} affilié${owed.length > 1 ? "s" : ""}`
          }
        />
        <StatTile
          label="Demandes de retrait"
          value={<span className="num">{formatNumber(open.length)}</span>}
          hint={open.length > 0 ? `${formatCurrency(openTotal)} demandés` : "aucune demande ouverte"}
        />
        <StatTile
          label="Déjà versé"
          value={<Money value={paidTotal} />}
          hint="depuis le début"
        />
      </div>

      <Section
        title="À payer"
        description="Chaque affilié à qui il reste quelque chose à envoyer. Le solde descend dès que tu enregistres le paiement ; ses statistiques ne bougent pas."
        flush
      >
        {owed.length === 0 ? (
          <EmptyState
            icon={<CircleCheck />}
            title="Tout le monde est à jour"
            description="Aucun affilié n'a de solde à recevoir pour l'instant."
          />
        ) : (
          <ul className="divide-y divide-border">
            {owed.map(({ publisher, ledger }) => {
              const details = Object.values(
                (publisher.paymentDetails as Record<string, string> | null) ?? {},
              ).filter((value) => typeof value === "string" && value.trim() !== "");
              const reachedMinimum =
                ledger!.balance >= toNumber(publisher.minPayout);
              return (
                <li
                  key={publisher.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5"
                >
                  <Link
                    href={`/admin/affiliates/${publisher.id}`}
                    className="min-w-0 flex-1 basis-56"
                  >
                    <Person
                      name={publisher.user.name}
                      detail={`#${publisher.memberId} · ${publisher.user.email}`}
                    />
                  </Link>

                  <div className="min-w-0 basis-52 text-[13px]">
                    {details.length > 0 ? (
                      <>
                        <p className="font-medium">
                          {paymentMethodLabel(publisher.paymentMethod)}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {details[0]}
                        </p>
                      </>
                    ) : (
                      <p className="text-warning">
                        Coordonnées de paiement manquantes
                      </p>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-4">
                    <div className="text-right">
                      <p className="num text-base font-semibold">
                        {formatCurrency(ledger!.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reachedMinimum
                          ? "minimum de retrait atteint"
                          : `sous le minimum (${formatCurrency(publisher.minPayout)})`}
                      </p>
                    </div>
                    <RecordPayoutDialog
                      publisherId={publisher.id}
                      publisherName={publisher.user.name}
                      balance={ledger!.balance}
                      defaultMethod={publisher.paymentMethod}
                      compact
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {open.length > 0 && (
        <Section
          title="Demandes de retrait"
          description="Un affilié a demandé à être payé. Marque la demande comme payée une fois l'argent envoyé, ou refuse-la."
          flush
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Affilié</TableHead>
                <TableHead>Demandé le</TableHead>
                <TableHead>Moyen</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="pr-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {open.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-5">
                    <Person
                      name={payment.publisher.user.name}
                      detail={payment.publisher.user.email}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payment.requestedAt)}
                  </TableCell>
                  <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                  <TableCell>
                    <PaymentStatus status={payment.status} />
                  </TableCell>
                  <TableCell className="num text-right font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="pr-3 text-right">
                    <PaymentStatusMenu
                      paymentId={payment.id}
                      currentStatus={payment.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      <Section
        title="Historique"
        description="Tous les paiements enregistrés, du plus récent au plus ancien."
        flush
      >
        {settled.length === 0 ? (
          <EmptyState
            icon={<Wallet />}
            title="Aucun paiement enregistré"
            description="Quand tu paies un affilié, note-le depuis la liste ci-dessus : il apparaîtra ici."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Affilié</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Moyen</TableHead>
                <TableHead className="hidden md:table-cell">Référence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="pr-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {settled.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-5">
                    <Person
                      name={payment.publisher.user.name}
                      detail={payment.publisher.user.email}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payment.paidAt ?? payment.requestedAt)}
                  </TableCell>
                  <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                  <TableCell className="hidden max-w-[220px] truncate text-muted-foreground md:table-cell">
                    {payment.note ?? "—"}
                  </TableCell>
                  <TableCell>
                    <PaymentStatus status={payment.status} />
                  </TableCell>
                  <TableCell className="num text-right font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="pr-3 text-right">
                    <DeletePayoutButton
                      paymentId={payment.id}
                      amountLabel={formatCurrency(payment.amount)}
                    />
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
