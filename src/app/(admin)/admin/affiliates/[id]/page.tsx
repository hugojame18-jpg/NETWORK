import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Receipt, Wallet } from "lucide-react";
import { getAffiliateProfile } from "@/lib/data/admin";
import {
  getAffiliateDays,
  getAffiliateLedger,
  getAffiliateMonths,
  getAffiliatePayments,
  recentMonths,
} from "@/lib/data/ledger";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordPayoutDialog } from "@/components/dashboard/admin/record-payout-dialog";
import { DeletePayoutButton } from "@/components/dashboard/admin/delete-payout-button";
import { paymentMethodLabel } from "@/lib/payment-methods";
import {
  formatCalendarDate,
  formatCurrency,
  formatDate,
  formatMonth,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
import type { AffiliateDay } from "@/lib/data/ledger";

export const metadata: Metadata = { title: "Fiche affilié" };

// Money that moves while the page is open: a cached render would show a
// balance that has already been paid.
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    PENDING: "secondary",
    SUSPENDED: "secondary",
    BANNED: "destructive",
  };

const PAYMENT_STATUS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  PENDING: { label: "En attente", variant: "secondary" },
  APPROVED: { label: "Validé", variant: "secondary" },
  PAID: { label: "Payé", variant: "default" },
  REJECTED: { label: "Refusé", variant: "destructive" },
};

/** A headline figure. The balance gets the accent; the rest stay quiet. */
function Tile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border border-primary/30 bg-primary/5 p-5"
          : "rounded-2xl border border-border bg-card p-5"
      }
    >
      <p className="eyebrow">{label}</p>
      <p className="num mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** One row per day of a month, with what the affiliate earned on it. */
function DayTable({ days }: { days: AffiliateDay[] }) {
  if (days.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted-foreground">
        Aucune journée enregistrée sur ce mois.
      </p>
    );
  }

  const totals = days.reduce(
    (sum, day) => ({
      clicks: sum.clicks + day.clicks,
      hosts: sum.hosts + day.hosts,
      conversions: sum.conversions + day.conversions,
      earnings: sum.earnings + day.earnings,
    }),
    { clicks: 0, hosts: 0, conversions: 0, earnings: 0 },
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Clics</TableHead>
          <TableHead className="text-right">Hosts</TableHead>
          <TableHead className="text-right">Conv.</TableHead>
          <TableHead className="text-right">Taux</TableHead>
          <TableHead className="text-right">Sa part</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.date.toISOString()}>
            <TableCell className="font-medium">
              {formatCalendarDate(day.date)}
            </TableCell>
            <TableCell className="num text-right">
              {formatNumber(day.clicks)}
            </TableCell>
            <TableCell className="num text-right text-muted-foreground">
              {formatNumber(day.hosts)}
            </TableCell>
            <TableCell className="num text-right font-medium">
              {formatNumber(day.conversions)}
            </TableCell>
            <TableCell className="num text-right text-muted-foreground">
              {formatPercent(day.conversionRate)}
            </TableCell>
            <TableCell className="num text-right font-semibold">
              {formatCurrency(day.earnings)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-muted/40">
          <TableCell className="font-semibold">Total</TableCell>
          <TableCell className="num text-right font-semibold">
            {formatNumber(totals.clicks)}
          </TableCell>
          <TableCell className="num text-right font-semibold">
            {formatNumber(totals.hosts)}
          </TableCell>
          <TableCell className="num text-right font-semibold">
            {formatNumber(totals.conversions)}
          </TableCell>
          <TableCell />
          <TableCell className="num text-right font-semibold">
            {formatCurrency(totals.earnings)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const publisher = await getAffiliateProfile(id);
  if (!publisher) notFound();

  const { current, previous } = recentMonths();

  const [ledger, months, currentDays, previousDays, payments] =
    await Promise.all([
      getAffiliateLedger(id),
      getAffiliateMonths(id),
      getAffiliateDays(id, current),
      getAffiliateDays(id, previous),
      getAffiliatePayments(id),
    ]);

  const monthByKey = new Map(months.map((month) => [month.key, month]));
  const thisMonth = monthByKey.get(current.toISOString().slice(0, 7));
  const lastMonth = monthByKey.get(previous.toISOString().slice(0, 7));

  const details = (publisher.paymentDetails as Record<string, string>) ?? {};
  const detailLines = Object.entries(details).filter(([, value]) =>
    Boolean(value),
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/affiliates" />}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les affiliés
      </Button>

      <PageHeader
        title={publisher.user.name}
        description={`#${publisher.memberId} · ${publisher.user.email} · inscrit le ${formatDate(
          publisher.createdAt,
        )}`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[publisher.user.status]}>
              {publisher.user.status}
            </Badge>
            <RecordPayoutDialog
              publisherId={publisher.id}
              publisherName={publisher.user.name}
              balance={ledger.balance}
              defaultMethod={publisher.paymentMethod}
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Solde à payer"
          value={formatCurrency(ledger.balance)}
          hint={
            ledger.pending > 0
              ? `dont ${formatCurrency(ledger.pending)} déjà demandés`
              : "ce qu'il reste à lui envoyer"
          }
          accent
        />
        <Tile
          label="Sa part ce mois-ci"
          value={formatCurrency(thisMonth?.earned ?? 0)}
          hint={formatMonth(current)}
        />
        <Tile
          label="Sa part le mois dernier"
          value={formatCurrency(lastMonth?.earned ?? 0)}
          hint={formatMonth(previous)}
        />
        <Tile
          label="Déjà payé"
          value={formatCurrency(ledger.paid)}
          hint={`sur ${formatCurrency(ledger.earned)} gagnés depuis le début`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ses conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">Commission</span>
              <span className="num font-medium">
                {(ledger.commissionRate * 100).toFixed(0)} %
              </span>
            </div>
            {ledger.isReferred && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">Part parrainage</span>
                <span className="num font-medium text-warning">
                  −{((ledger.commissionRate - ledger.rate) * 100).toFixed(0)} %
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <span className="text-muted-foreground">Il garde</span>
              <span className="num font-semibold">
                {(ledger.rate * 100).toFixed(0)} % du brut
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">sub3</span>
              <span className="font-mono text-xs">
                {publisher.postbackToken ?? "—"}
              </span>
            </div>
            {publisher.referredBy && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">Parrainé par</span>
                <Link
                  href={`/admin/affiliates/${publisher.referredBy.id}`}
                  className="font-medium hover:underline"
                >
                  {publisher.referredBy.user.name}
                </Link>
              </div>
            )}
            {publisher._count.referrals > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">Ses filleuls</span>
                <span className="num font-medium">
                  {publisher._count.referrals}
                </span>
              </div>
            )}
            {ledger.referralEarnings > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">
                  Gains de parrainage
                </span>
                <span className="num font-medium">
                  {formatCurrency(ledger.referralEarnings)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Où envoyer l&apos;argent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">Moyen choisi</span>
              <span className="font-medium">
                {paymentMethodLabel(publisher.paymentMethod)}
              </span>
            </div>
            {detailLines.length > 0 ? (
              detailLines.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-muted-foreground capitalize">
                    {key}
                  </span>
                  <span className="font-mono text-xs break-all">{value}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Il n&apos;a pas encore renseigné ses coordonnées de paiement.
                Demande-les-lui avant d&apos;envoyer quoi que ce soit.
              </p>
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <span className="text-muted-foreground">Minimum de retrait</span>
              <span className="num font-medium">
                {formatCurrency(toNumber(publisher.minPayout))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Mois par mois
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {months.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Aucune statistique enregistrée pour cet affilié.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Hosts</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Taux conv.</TableHead>
                  <TableHead className="text-right">Brut réseau</TableHead>
                  <TableHead className="text-right">Sa part</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map((month) => (
                  <TableRow key={month.key}>
                    <TableCell className="font-medium capitalize">
                      {formatMonth(month.start)}
                    </TableCell>
                    <TableCell className="num text-right">
                      {formatNumber(month.clicks)}
                    </TableCell>
                    <TableCell className="num text-right text-muted-foreground">
                      {formatNumber(month.hosts)}
                    </TableCell>
                    <TableCell className="num text-right font-medium">
                      {formatNumber(month.conversions)}
                    </TableCell>
                    <TableCell className="num text-right text-muted-foreground">
                      {formatPercent(month.conversionRate)}
                    </TableCell>
                    <TableCell className="num text-right text-muted-foreground">
                      {formatCurrency(month.gross)}
                    </TableCell>
                    <TableCell className="num text-right font-semibold">
                      {formatCurrency(month.earned)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Détail par jour</CardTitle>
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current" className="capitalize">
                {formatMonth(current)}
              </TabsTrigger>
              <TabsTrigger value="previous" className="capitalize">
                {formatMonth(previous)}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-3">
              <DayTable days={currentDays} />
            </TabsContent>
            <TabsContent value="previous" className="mt-3">
              <DayTable days={previousDays} />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Paiements
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {payments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              <Wallet className="mx-auto mb-2 h-5 w-5" />
              Aucun paiement enregistré. Quand tu lui envoies de l&apos;argent,
              note-le ici : son solde descend, ses statistiques ne bougent pas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Moyen</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.paidAt ?? payment.requestedAt)}
                    </TableCell>
                    <TableCell className="num text-right font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabel(payment.method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS[payment.status].variant}>
                        {PAYMENT_STATUS[payment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                      {payment.note ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
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
        </CardContent>
      </Card>
    </div>
  );
}
