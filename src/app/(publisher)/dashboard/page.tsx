import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MousePointerClick,
  Send,
  Sun,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getPublisherByUserId,
  getRevenueSummary,
  getPerformanceSeries,
  getMonthlyLeaderboard,
  getActiveAnnouncements,
  getRecentConversions,
  getRewardsOverview,
} from "@/lib/data/publisher";
import { getAffiliateLedger } from "@/lib/data/ledger";
import { appUrl } from "@/lib/app-url";
import { SUPPORT_TELEGRAM } from "@/lib/contact";
import {
  compareWindows,
  conversionRate,
  progressToward,
  sumWindow,
  tail,
} from "@/lib/trend";
import { AnnouncementBanner } from "@/components/dashboard/announcement-banner";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { PageHeader } from "@/components/dashboard/page-header";
import { Mascot } from "@/components/brand/mascot";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CopyButton } from "@/components/dashboard/copy-button";
import {
  Money,
  ProgressBar,
  Section,
  StatTile,
} from "@/components/dashboard/kit";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCalendarDate,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelative,
  toNumber,
} from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

/** A ranking of one or two people is not a ranking. */
const MIN_RANKED_FOR_LEADERBOARD = 3;

const todayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default async function PublisherHomePage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [revenue, series, leaderboard, announcements, ledger, conversions, rewards] =
    await Promise.all([
      getRevenueSummary(publisher.id),
      getPerformanceSeries(publisher.id, 90),
      getMonthlyLeaderboard(publisher.id),
      getActiveAnnouncements(),
      getAffiliateLedger(publisher.id),
      getRecentConversions(publisher.id, 7),
      getRewardsOverview(publisher.id),
    ]);

  const hasActivity = series.some(
    (day) => day.clicks > 0 || day.conversions > 0 || day.revenue > 0,
  );

  // Every figure below is read off the same ninety days, so the tiles, the
  // chart and the table cannot disagree with one another.
  const gains = (day: (typeof series)[number]) => day.revenue;
  const week = compareWindows(series, gains, 7);
  const yesterday = sumWindow(series, gains, 1, 1);
  const clicks30 = sumWindow(series, (day) => day.clicks, 30);
  const conversions30 = sumWindow(series, (day) => day.conversions, 30);
  const clicksPrev30 = sumWindow(series, (day) => day.clicks, 30, 30);
  const conversionsPrev30 = sumWindow(series, (day) => day.conversions, 30, 30);
  const rate30 = conversionRate(conversions30, clicks30);
  const ratePrev30 = conversionRate(conversionsPrev30, clicksPrev30);

  const recentDays = [...series]
    .reverse()
    .filter((day) => day.clicks > 0 || day.conversions > 0 || day.revenue > 0)
    .slice(0, 7);

  const firstName = (user.name ?? "").split(" ")[0];
  const minPayout = toNumber(publisher.minPayout);
  const canRequest = ledger.available >= minPayout && minPayout > 0;
  const missing = Math.max(0, minPayout - ledger.balance);

  const paymentDetails =
    (publisher.paymentDetails as Record<string, string> | null) ?? {};
  const hasPaymentDetails = Object.values(paymentDetails).some(
    (value) => typeof value === "string" && value.trim() !== "",
  );

  const referralLink = `${appUrl()}/sign-up?ref=${rewards.referralCode}`;
  // Shown without the scheme: it is the part nobody reads, and it is what
  // pushes the code off the end of a narrow card.
  const referralDisplay = referralLink.split("://").pop() ?? referralLink;

  const today = todayFormatter.format(new Date());
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="space-y-6">
      {publisher.onboardingSeenAt === null && <OnboardingTour />}

      <PageHeader
        title={firstName ? `Salut ${firstName}` : "Salut 👋"}
        description={`${todayLabel} — voici où tu en es.`}
        leading={<Mascot wink className="h-14 w-14 shrink-0" />}
        action={
          <Button variant="outline" render={<Link href="/dashboard/stats" />}>
            Toutes mes stats
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <AnnouncementBanner announcements={announcements} />

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

      <div className="grid gap-4 lg:grid-cols-12">
        {/* What they are owed, and how far the next payout is. The question an
            affiliate opens the app with, so it gets the first seat. */}
        <div className="surface-brand flex flex-col p-6 lg:col-span-4">
          <p className="eyebrow">Solde à recevoir</p>
          <p className="mt-3 text-[44px] leading-none font-semibold tracking-tight">
            <Money value={ledger.balance} />
          </p>

          <div className="mt-6">
            <ProgressBar value={progressToward(ledger.balance, minPayout)} />
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              {canRequest ? (
                <span className="font-medium text-success">
                  Tu as atteint le minimum de retrait.
                </span>
              ) : (
                <>
                  Encore{" "}
                  <span className="num font-medium text-foreground">
                    {formatCurrency(missing)}
                  </span>{" "}
                  avant de pouvoir demander ton paiement
                  <span className="num"> ({formatCurrency(minPayout)})</span>.
                </>
              )}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-primary/15 pt-5 text-[13px]">
            <div>
              <dt className="text-muted-foreground">Gagné au total</dt>
              <dd className="num mt-1 font-semibold">
                {formatCurrency(ledger.earned)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Déjà versé</dt>
              <dd className="num mt-1 font-semibold">
                {formatCurrency(ledger.paid)}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-6">
            <Button
              className="w-full"
              variant={canRequest ? "default" : "outline"}
              render={<Link href="/dashboard/payments" />}
            >
              {canRequest ? "Demander mon paiement" : "Voir mes paiements"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          <StatTile
            label="Aujourd'hui"
            value={<Money value={revenue.today} />}
            hint={`hier : ${formatCurrency(yesterday)}`}
            spark={tail(series, 14).map(gains)}
            icon={<Sun />}
          />
          <StatTile
            label="7 derniers jours"
            value={<Money value={week.current} />}
            delta={week.delta}
            hint="vs les 7 jours d'avant"
            spark={tail(series, 30).map(gains)}
            icon={<TrendingUp />}
          />
          <StatTile
            label="Ce mois-ci"
            value={<Money value={revenue.month} />}
            hint={`${formatCurrency(revenue.total)} depuis le début`}
            icon={<CalendarDays />}
          />
          <StatTile
            label="Taux de conversion · 30 j"
            value={<span className="num">{formatPercent(rate30)}</span>}
            delta={ratePrev30 > 0 ? ((rate30 - ratePrev30) / ratePrev30) * 100 : null}
            hint={`${formatNumber(conversions30)} conv. sur ${formatNumber(clicks30)} clics`}
            icon={<Target />}
          />
        </div>
      </div>

      {/* Nothing has happened yet: say what happens next instead of showing
          a page of zeros. */}
      {!hasActivity && (
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
          <Button
            render={
              <a href={SUPPORT_TELEGRAM} target="_blank" rel="noopener noreferrer" />
            }
          >
            Demander mon lien
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {hasActivity && (
        <>
          <div className="grid gap-4 lg:grid-cols-12">
            <Section
              title="Tes gains par jour"
              description="Ce que chaque journée t'a rapporté. Le dernier jour est encore en cours."
              className="lg:col-span-8"
            >
              <TrendChart
                data={series}
                bars={{ key: "revenue", label: "Tes gains", kind: "money" }}
                details={[
                  { key: "conversions", label: "Conversions", kind: "count" },
                  { key: "clicks", label: "Clics", kind: "count" },
                ]}
                ranges={[7, 30, 90]}
                defaultRange={30}
              />
            </Section>

            <Section
              title="Dernières conversions"
              description="Une par une, dès qu'elles sont validées."
              action={
                <Link
                  href="/dashboard/history"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Tout voir
                  <ArrowRight className="h-3 w-3" />
                </Link>
              }
              className="lg:col-span-4"
              flush
            >
              {conversions.length === 0 ? (
                <p className="px-5 pb-6 text-sm text-muted-foreground">
                  Tes conversions apparaîtront ici dès la première.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {conversions.map((conversion) => (
                    <li
                      key={conversion.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span
                        className={
                          conversion.reversed
                            ? "h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
                            : "h-2 w-2 shrink-0 rounded-full bg-success"
                        }
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {conversion.offer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(conversion.at)}
                          {conversion.reversed && " · annulée"}
                        </p>
                      </div>
                      <span
                        className={
                          conversion.reversed
                            ? "num text-sm text-muted-foreground line-through"
                            : "num text-sm font-semibold"
                        }
                      >
                        {!conversion.reversed && "+"}
                        {formatCurrency(conversion.earnings)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Section
              title="Tes dernières journées"
              action={
                <Link
                  href="/dashboard/stats"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Toutes les journées
                  <ArrowRight className="h-3 w-3" />
                </Link>
              }
              className="lg:col-span-8"
              flush
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Date</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Taux</TableHead>
                    <TableHead className="pr-5 text-right">Tes gains</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDays.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="pl-5 font-medium">
                        {formatCalendarDate(day.date)}
                      </TableCell>
                      <TableCell className="num text-right text-muted-foreground">
                        {formatNumber(day.clicks)}
                      </TableCell>
                      <TableCell className="num text-right">
                        {formatNumber(day.conversions)}
                      </TableCell>
                      <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                        {formatPercent(conversionRate(day.conversions, day.clicks))}
                      </TableCell>
                      <TableCell className="num pr-5 text-right font-semibold">
                        {formatCurrency(day.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Section
              title="Parraine, gagne 10 %"
              description="Du chiffre d'affaires de chaque affilié qui s'inscrit avec ton lien."
              className="lg:col-span-4"
            >
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                  {referralDisplay}
                </code>
                <CopyButton value={referralLink} />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Filleuls
                  </dt>
                  <dd className="num mt-1.5 text-xl font-semibold">
                    {formatNumber(rewards.referralCount)}
                  </dd>
                </div>
                <div className="rounded-xl border border-border p-3.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    Gagné grâce à eux
                  </dt>
                  <dd className="mt-1.5 text-xl font-semibold">
                    <Money value={rewards.referralEarnings} />
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium">
                    Palier {rewards.tier.current.label}
                  </span>
                  {rewards.tier.next ? (
                    <span className="text-muted-foreground">
                      {rewards.tier.next.label} dans{" "}
                      <span className="num">
                        {formatCurrency(rewards.tier.remaining)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Palier maximum</span>
                  )}
                </div>
                <ProgressBar value={rewards.tier.progress / 100} className="mt-2.5" />
                <Link
                  href="/dashboard/rewards"
                  className="mt-3.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Voir mes récompenses
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Section>
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
