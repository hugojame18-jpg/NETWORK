import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send, Wallet } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getPublisherByUserId,
  getRevenueSummary,
  getPerformanceSeries,
  getMonthlyLeaderboard,
  getActiveAnnouncements,
  getPublisherSnapshot,
  getRecentConversions,
} from "@/lib/data/publisher";
import { getAffiliateLedger } from "@/lib/data/ledger";
import { SUPPORT_TELEGRAM } from "@/lib/contact";
import { AnnouncementBanner } from "@/components/dashboard/announcement-banner";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { EarningsHero } from "@/components/dashboard/next-step";
import { PageHeader } from "@/components/dashboard/page-header";
import { TopPerformers } from "@/components/dashboard/top-performers";
import {
  PerformanceChart,
  type ChartSeriesConfig,
} from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatCalendarDate,
  formatDateTime,
  formatNumber,
} from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

// Clicks and conversions live on wildly different scales from euros, so the
// home chart shows the two the affiliate steers on. The full breakdown is one
// click away in Statistiques.
const HOME_SERIES: ChartSeriesConfig[] = [
  {
    key: "conversions",
    label: "Conversions",
    color: "var(--chart-4)",
    fill: false,
  },
  {
    key: "revenue",
    label: "Gains ($)",
    color: "var(--chart-1)",
    axis: "right",
  },
];

/** A ranking of one or two people is not a ranking. */
const MIN_RANKED_FOR_LEADERBOARD = 3;

export default async function PublisherHomePage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [
    revenue,
    series,
    leaderboard,
    announcements,
    snapshot,
    ledger,
    conversions,
  ] = await Promise.all([
    getRevenueSummary(publisher.id),
    getPerformanceSeries(publisher.id, 30),
    getMonthlyLeaderboard(publisher.id),
    getActiveAnnouncements(),
    getPublisherSnapshot(publisher.id),
    getAffiliateLedger(publisher.id),
    getRecentConversions(publisher.id),
  ]);

  const recentDays = [...series]
    .reverse()
    .filter((day) => day.clicks > 0 || day.conversions > 0 || day.revenue > 0)
    .slice(0, 7);

  const firstName = (user.name ?? "").split(" ")[0];

  const paymentDetails =
    (publisher.paymentDetails as Record<string, string> | null) ?? {};
  const hasPaymentDetails = Object.values(paymentDetails).some(
    (value) => typeof value === "string" && value.trim() !== "",
  );

  return (
    <div className="space-y-6">
      {publisher.onboardingSeenAt === null && <OnboardingTour />}

      <PageHeader
        title={firstName ? `Salut ${firstName}` : "Salut 👋"}
        description="Voici où tu en es aujourd'hui."
      />

      <AnnouncementBanner announcements={announcements} />

      <EarningsHero
        month={revenue.month}
        today={revenue.today}
        total={revenue.total}
        balance={ledger.balance}
        formatValue={formatCurrency}
      />

      {/* Money is owed and there is nowhere to send it: the one thing that
          would hold up a payout, said before it holds one up. */}
      {!hasPaymentDetails && ledger.balance > 0 && (
        <Link
          href="/dashboard/profile"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/8 p-4 transition hover:border-warning/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <Wallet className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Dis-nous où t&apos;envoyer tes {formatCurrency(ledger.balance)}
            </p>
            <p className="text-sm text-muted-foreground">
              Tu n&apos;as pas encore renseigné ton moyen de paiement. Sans lui,
              on ne peut pas te payer.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Le renseigner
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      {/* Nothing has happened yet: say what happens next instead of showing
          a page of zeros. */}
      {snapshot.statDays === 0 && (
        <div className="surface flex flex-wrap items-start gap-5 p-5 sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[17px] leading-snug font-semibold tracking-tight">
              Ton lien arrive
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              L&apos;équipe te remet ton lien de tracking. Dès que ton trafic
              passe dessus, tes clics et tes conversions s&apos;affichent ici
              tout seuls. Tu ne l&apos;as pas encore reçu ? Écris-nous.
            </p>
          </div>
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Demander mon lien
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Charts and tables only earn their place once there is data to show. */}
      {snapshot.statDays > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ton activité</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={series} series={HOME_SERIES} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tes dernières conversions</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {conversions.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Tes conversions apparaîtront ici une par une, dès
                    qu&apos;elles sont validées.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reçue le</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead className="text-right">Ton gain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversions.map((conversion) => (
                        <TableRow key={conversion.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDateTime(conversion.at)}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {conversion.offer ?? "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {conversion.reversed ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="num text-muted-foreground line-through">
                                  {formatCurrency(conversion.earnings)}
                                </span>
                                <Badge variant="secondary">Annulée</Badge>
                              </span>
                            ) : (
                              <span className="num font-medium">
                                +{formatCurrency(conversion.earnings)}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Tes dernières journées</CardTitle>
                  <Link
                    href="/dashboard/stats"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Tout voir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Clics</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Tes gains</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDays.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{formatCalendarDate(day.date)}</TableCell>
                        <TableCell className="num text-right">
                          {formatNumber(day.clicks)}
                        </TableCell>
                        <TableCell className="num text-right">
                          {formatNumber(day.conversions)}
                        </TableCell>
                        <TableCell className="num text-right font-medium">
                          {formatCurrency(day.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {leaderboard.totalRanked >= MIN_RANKED_FOR_LEADERBOARD && (
            <TopPerformers
              periodLabel={leaderboard.periodLabel}
              top={leaderboard.top}
              me={leaderboard.me}
              totalRanked={leaderboard.totalRanked}
            />
          )}
        </>
      )}
    </div>
  );
}
