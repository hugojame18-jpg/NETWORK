import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wallet } from "lucide-react";
import { getAffiliateProfile } from "@/lib/data/admin";
import { getPerformanceSeries } from "@/lib/data/publisher";
import {
  getAffiliateDays,
  getAffiliateLedger,
  getAffiliateMonths,
  getAffiliatePayments,
  recentMonths,
  type AffiliateDay,
} from "@/lib/data/ledger";
import { compareWindows, tail } from "@/lib/trend";
import {
  AccountStatus,
  Initials,
  Money,
  PaymentStatus,
  Section,
  StatTile,
} from "@/components/dashboard/kit";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ApplicationDetails } from "@/components/dashboard/admin/application-details";
import { RecordPayoutDialog } from "@/components/dashboard/admin/record-payout-dialog";
import { DeletePayoutButton } from "@/components/dashboard/admin/delete-payout-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const metadata: Metadata = { title: "Fiche affilié" };

// Money that moves while the page is open: a cached render would show a
// balance that has already been paid.
export const dynamic = "force-dynamic";

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
      gross: sum.gross + day.gross,
      earnings: sum.earnings + day.earnings,
    }),
    { clicks: 0, hosts: 0, conversions: 0, gross: 0, earnings: 0 },
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-5">Date</TableHead>
          <TableHead className="text-right">Clics</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
          <TableHead className="text-right">Conv.</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Taux</TableHead>
          <TableHead className="hidden text-right md:table-cell">Brut</TableHead>
          <TableHead className="pr-5 text-right">Sa part</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.date.toISOString()}>
            <TableCell className="pl-5 font-medium">
              {formatCalendarDate(day.date)}
            </TableCell>
            <TableCell className="num text-right">
              {formatNumber(day.clicks)}
            </TableCell>
            <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
              {formatNumber(day.hosts)}
            </TableCell>
            <TableCell className="num text-right">
              {formatNumber(day.conversions)}
            </TableCell>
            <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
              {day.clicks > 0 ? formatPercent(day.conversionRate) : "—"}
            </TableCell>
            <TableCell className="num hidden text-right text-muted-foreground md:table-cell">
              {formatCurrency(day.gross)}
            </TableCell>
            <TableCell className="num pr-5 text-right font-semibold">
              {formatCurrency(day.earnings)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableCell className="pl-5 font-semibold">Total</TableCell>
          <TableCell className="num text-right font-semibold">
            {formatNumber(totals.clicks)}
          </TableCell>
          <TableCell className="num hidden text-right font-semibold sm:table-cell">
            {formatNumber(totals.hosts)}
          </TableCell>
          <TableCell className="num text-right font-semibold">
            {formatNumber(totals.conversions)}
          </TableCell>
          <TableCell className="hidden sm:table-cell" />
          <TableCell className="num hidden text-right font-semibold md:table-cell">
            {formatCurrency(totals.gross)}
          </TableCell>
          <TableCell className="num pr-5 text-right font-semibold">
            {formatCurrency(totals.earnings)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{children}</dd>
    </div>
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

  const [ledger, months, currentDays, previousDays, payments, series] =
    await Promise.all([
      getAffiliateLedger(id),
      getAffiliateMonths(id),
      getAffiliateDays(id, current),
      getAffiliateDays(id, previous),
      getAffiliatePayments(id),
      getPerformanceSeries(id, 90),
    ]);

  const monthByKey = new Map(months.map((month) => [month.key, month]));
  const thisMonth = monthByKey.get(current.toISOString().slice(0, 7));
  const lastMonth = monthByKey.get(previous.toISOString().slice(0, 7));

  const gains = (day: (typeof series)[number]) => day.revenue;
  const week = compareWindows(series, gains, 7);

  const details = Object.entries(
    (publisher.paymentDetails as Record<string, string> | null) ?? {},
  ).filter(([, value]) => Boolean(value));

  const sub3 = [
    publisher.postbackToken,
    ...publisher.sub3Aliases.map((alias) => alias.token),
  ].filter((token): token is string => Boolean(token));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/affiliates"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les affiliés
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Initials name={publisher.user.name} className="h-12 w-12 text-base" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate text-[22px] leading-tight font-semibold tracking-tight">
                {publisher.user.name}
              </h1>
              <AccountStatus status={publisher.user.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              #{publisher.memberId} · {publisher.user.email} · inscrit le{" "}
              {formatDate(publisher.createdAt)}
            </p>
          </div>
        </div>
        <RecordPayoutDialog
          publisherId={publisher.id}
          publisherName={publisher.user.name}
          balance={ledger.balance}
          defaultMethod={publisher.paymentMethod}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-brand flex flex-col p-5">
          <p className="eyebrow">Solde à payer</p>
          <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight">
            <Money value={ledger.balance} />
          </p>
          <p className="mt-2.5 text-xs text-muted-foreground">
            {ledger.pending > 0
              ? `dont ${formatCurrency(ledger.pending)} déjà demandés`
              : `${formatCurrency(ledger.paid)} déjà payés sur ${formatCurrency(ledger.earned)}`}
          </p>
        </div>
        <StatTile
          label="Sa part · 7 jours"
          value={<Money value={week.current} />}
          delta={week.delta}
          hint="vs les 7 jours d'avant"
          spark={tail(series, 30).map(gains)}
        />
        <StatTile
          label="Sa part ce mois-ci"
          value={<Money value={thisMonth?.earned ?? 0} />}
          hint={`${formatNumber(thisMonth?.conversions ?? 0)} conversions en ${formatMonth(current)}`}
        />
        <StatTile
          label="Sa part le mois dernier"
          value={<Money value={lastMonth?.earned ?? 0} />}
          hint={`${formatNumber(lastMonth?.conversions ?? 0)} conversions en ${formatMonth(previous)}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Section
          title="Ce qu'il gagne par jour"
          description="Sa part, jour après jour. Le dernier jour est encore en cours."
          className="lg:col-span-8"
        >
          <TrendChart
            data={series}
            bars={{ key: "revenue", label: "Sa part", kind: "money" }}
            details={[
              { key: "conversions", label: "Conversions", kind: "count" },
              { key: "clicks", label: "Clics", kind: "count" },
            ]}
            ranges={[7, 30, 90]}
            defaultRange={30}
            height={240}
          />
        </Section>

        <div className="space-y-4 lg:col-span-4">
          <Section title="Ses conditions">
            <dl className="space-y-2.5 text-sm">
              <Fact label="Commission">
                <span className="num">
                  {(ledger.commissionRate * 100).toFixed(0)} %
                </span>
              </Fact>
              {ledger.isReferred && (
                <Fact label="Part parrainage">
                  <span className="num text-warning">
                    −{((ledger.commissionRate - ledger.rate) * 100).toFixed(0)} %
                  </span>
                </Fact>
              )}
              <Fact label="Il garde">
                <span className="num">{(ledger.rate * 100).toFixed(0)} % du brut</span>
              </Fact>
              <Fact label="sub3">
                <span className="font-mono text-xs break-all">
                  {sub3.length > 0 ? sub3.join(" · ") : "—"}
                </span>
              </Fact>
              {publisher.referredBy && (
                <Fact label="Parrainé par">
                  <Link
                    href={`/admin/affiliates/${publisher.referredBy.id}`}
                    className="hover:underline"
                  >
                    {publisher.referredBy.user.name}
                  </Link>
                </Fact>
              )}
              {publisher._count.referrals > 0 && (
                <Fact label="Ses filleuls">
                  <span className="num">
                    {publisher._count.referrals} ·{" "}
                    {formatCurrency(ledger.referralEarnings)} gagnés
                  </span>
                </Fact>
              )}
            </dl>
            <div className="mt-3 border-t border-border pt-3">
              <ApplicationDetails
                workedWithNetworks={publisher.workedWithNetworks}
                previousNetworks={publisher.previousNetworks}
                affiliateExperience={publisher.affiliateExperience}
                tiktokLinks={publisher.tiktokLinks}
                website={publisher.website}
              />
            </div>
          </Section>

          <Section title="Où envoyer l'argent">
            {details.length > 0 ? (
              <dl className="space-y-2.5 text-sm">
                <Fact label="Moyen">
                  {paymentMethodLabel(publisher.paymentMethod)}
                </Fact>
                {details.map(([key, value]) => (
                  <Fact key={key} label={key}>
                    <span className="font-mono text-xs break-all">{value}</span>
                  </Fact>
                ))}
                <Fact label="Minimum de retrait">
                  <span className="num">
                    {formatCurrency(toNumber(publisher.minPayout))}
                  </span>
                </Fact>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Il n&apos;a pas encore renseigné ses coordonnées de paiement.
                Demande-les-lui avant d&apos;envoyer quoi que ce soit.
              </p>
            )}
          </Section>
        </div>
      </div>

      <Section
        title="Mois par mois"
        description="Tout son historique, du plus récent au plus ancien."
        flush
      >
        {months.length === 0 ? (
          <p className="px-5 pb-8 pt-2 text-center text-sm text-muted-foreground">
            Aucune statistique enregistrée pour cet affilié.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Mois</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Taux</TableHead>
                <TableHead className="hidden text-right md:table-cell">Brut réseau</TableHead>
                <TableHead className="pr-5 text-right">Sa part</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow key={month.key}>
                  <TableCell className="pl-5 font-medium capitalize">
                    {formatMonth(month.start)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatNumber(month.clicks)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                    {formatNumber(month.hosts)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatNumber(month.conversions)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                    {formatPercent(month.conversionRate)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground md:table-cell">
                    {formatCurrency(month.gross)}
                  </TableCell>
                  <TableCell className="num pr-5 text-right font-semibold">
                    {formatCurrency(month.earned)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <section className="surface overflow-hidden">
        <Tabs defaultValue="current" className="gap-0">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
            <h2 className="text-[15px] leading-snug font-semibold tracking-tight">
              Détail par jour
            </h2>
            <TabsList>
              <TabsTrigger value="current" className="px-3 capitalize">
                {formatMonth(current)}
              </TabsTrigger>
              <TabsTrigger value="previous" className="px-3 capitalize">
                {formatMonth(previous)}
              </TabsTrigger>
            </TabsList>
          </header>
          <TabsContent value="current">
            <DayTable days={currentDays} />
          </TabsContent>
          <TabsContent value="previous">
            <DayTable days={previousDays} />
          </TabsContent>
        </Tabs>
      </section>

      <Section
        title="Paiements"
        description="Ce qui lui a été envoyé. Un paiement descend son solde, jamais ses statistiques."
        flush
      >
        {payments.length === 0 ? (
          <div className="px-5 pb-8 pt-2 text-center text-sm text-muted-foreground">
            <Wallet className="mx-auto mb-2 h-5 w-5" />
            Aucun paiement enregistré pour l&apos;instant.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Date</TableHead>
                <TableHead>Moyen</TableHead>
                <TableHead className="hidden md:table-cell">Référence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="pr-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-5 font-medium">
                    {formatDate(payment.paidAt ?? payment.requestedAt)}
                  </TableCell>
                  <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                  <TableCell className="hidden max-w-[260px] truncate text-muted-foreground md:table-cell">
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
