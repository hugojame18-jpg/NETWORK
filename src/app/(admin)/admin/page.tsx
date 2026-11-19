import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowUp,
  Coins,
  RefreshCw,
  Sun,
  Target,
  TrendingUp,
  Unplug,
  Wallet,
  Webhook,
} from "lucide-react";
import {
  getAdminPulse,
  getNetworkSeries,
  getRecentNetworkConversions,
  getRevenueByPublisher,
  resolvePeriod,
} from "@/lib/data/admin";
import { compareWindows, conversionRate, sumWindow, tail } from "@/lib/trend";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Initials,
  Money,
  Section,
  StatTile,
  Status,
} from "@/components/dashboard/kit";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelative,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pilotage" };

// Today's money and what is waiting: never a cached answer.
export const dynamic = "force-dynamic";

const todayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Something that costs money or trust if it is left alone. */
function Pending({
  href,
  label,
  count,
  waitingText,
  idleText,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  /** Said under the label when there is something to do. */
  waitingText: string;
  idleText: string;
  icon: typeof Wallet;
}) {
  const waiting = count > 0;
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-4 transition",
        waiting
          ? "border-warning/40 bg-warning/8 hover:border-warning/70"
          : "border-border hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4",
          waiting ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {waiting ? waitingText : idleText}
        </p>
      </div>
      <span
        className={cn(
          "num text-2xl font-semibold",
          waiting ? "text-warning" : "text-muted-foreground/40",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

export default async function AdminHomePage() {
  const [pulse, series, top, feed] = await Promise.all([
    getAdminPulse(),
    getNetworkSeries(90),
    getRevenueByPublisher(resolvePeriod("month")),
    getRecentNetworkConversions(8),
  ]);

  const gross = (day: (typeof series)[number]) => day.revenue;
  const margin = (day: (typeof series)[number]) => day.margin;
  const conversions = (day: (typeof series)[number]) => day.conversions;
  const clicks = (day: (typeof series)[number]) => day.clicks;

  const yesterdayGross = sumWindow(series, gross, 1, 1);
  const weekMargin = compareWindows(series, margin, 7);
  const weekConversions = compareWindows(series, conversions, 7);
  const weekClicks = compareWindows(series, clicks, 7);
  const rate7 = conversionRate(weekConversions.current, weekClicks.current);
  const ratePrev7 = conversionRate(weekConversions.previous, weekClicks.previous);

  const month = pulse.month;
  const marginShare = month.revenue > 0 ? month.margin / month.revenue : 0;

  const toDo =
    pulse.owedCount +
    pulse.pendingPayments +
    pulse.unknownSub3.length +
    pulse.rejectedHits;

  const syncBroken = pulse.sync.configured && pulse.sync.ok === false;
  const leader = Math.max(1, ...top.map((row) => row.revenue));
  const today = todayFormatter.format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pilotage"
        description={`${today.charAt(0).toUpperCase()}${today.slice(1)} — l'état du réseau, et ce qui attend après toi.`}
        action={
          <Button variant="outline" render={<Link href="/admin/revenue" />}>
            Chiffre d&apos;affaires
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Money first: the margin is the figure the whole business turns on,
            shown with what it was carved out of. */}
        <div className="surface-brand flex flex-col p-6 lg:col-span-5">
          <p className="eyebrow">Ta marge ce mois-ci</p>
          <p className="mt-3 text-[44px] leading-none font-semibold tracking-tight">
            <Money value={month.margin} />
          </p>

          <div className="mt-6">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--chart-3)_45%,var(--card))]">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${marginShare * 100}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
              <div>
                <dt className="text-muted-foreground">CA brut</dt>
                <dd className="num mt-1 font-semibold">
                  {formatCurrency(month.revenue)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full bg-[color-mix(in_oklch,var(--chart-3)_45%,var(--card))]"
                    aria-hidden
                  />
                  Aux affiliés
                </dt>
                <dd className="num mt-1 font-semibold">
                  {formatCurrency(month.affiliateShare)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                  Ta part
                </dt>
                <dd className="num mt-1 font-semibold">
                  {formatPercent(marginShare * 100)}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-auto pt-6 text-[13px] text-muted-foreground">
            <span className="num font-medium text-foreground">
              {formatNumber(month.conversions)}
            </span>{" "}
            conversions sur{" "}
            <span className="num font-medium text-foreground">
              {formatNumber(month.clicks)}
            </span>{" "}
            clics ce mois-ci.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          <StatTile
            label="CA brut aujourd'hui"
            value={<Money value={pulse.today.revenue} />}
            hint={`hier : ${formatCurrency(yesterdayGross)}`}
            spark={tail(series, 14).map(gross)}
            icon={<Sun />}
          />
          <StatTile
            label="Marge · 7 jours"
            value={<Money value={weekMargin.current} />}
            delta={weekMargin.delta}
            hint="vs les 7 jours d'avant"
            spark={tail(series, 30).map(margin)}
            icon={<Coins />}
          />
          <StatTile
            label="Conversions · 7 jours"
            value={<span className="num">{formatNumber(weekConversions.current)}</span>}
            delta={weekConversions.delta}
            hint={`${formatNumber(pulse.today.conversions)} aujourd'hui`}
            spark={tail(series, 30).map(conversions)}
            icon={<Target />}
          />
          <StatTile
            label="Taux de conversion · 7 jours"
            value={<span className="num">{formatPercent(rate7)}</span>}
            delta={ratePrev7 > 0 ? ((rate7 - ratePrev7) / ratePrev7) * 100 : null}
            hint={`${formatNumber(weekClicks.current)} clics · ${formatNumber(pulse.activeToday)} affilié${pulse.activeToday > 1 ? "s" : ""} actif${pulse.activeToday > 1 ? "s" : ""} aujourd'hui`}
            icon={<TrendingUp />}
          />
        </div>
      </div>

      <Section
        title="À traiter"
        description={
          toDo === 0
            ? "Rien n'attend après toi."
            : "Ce qui coûte de l'argent ou de la confiance si on le laisse traîner."
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Pending
            href="/admin/payments"
            label="Soldes à payer"
            count={pulse.owedCount}
            waitingText={`${formatCurrency(pulse.owed)} à envoyer`}
            idleText="personne n'attend d'argent"
            icon={BanknoteArrowUp}
          />
          <Pending
            href="/admin/payments"
            label="Demandes de retrait"
            count={pulse.pendingPayments}
            waitingText="en attente de toi"
            idleText="aucune demande ouverte"
            icon={Wallet}
          />
          <Pending
            href="/admin/flow"
            label="sub3 non rattachés"
            count={pulse.unknownSub3.length}
            waitingText="du trafic sans propriétaire"
            idleText="tout le trafic est attribué"
            icon={Unplug}
          />
          <Pending
            href="/admin/postback"
            label="Postbacks rejetés"
            count={pulse.rejectedHits}
            waitingText="sur les 7 derniers jours"
            idleText="aucun rejet cette semaine"
            icon={Webhook}
          />
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Section
          title="Activité du réseau"
          description="Ce que le réseau encaisse chaque jour, et ce qu'il t'en reste."
          className="lg:col-span-8"
        >
          <TrendChart
            data={series}
            bars={{ key: "revenue", label: "CA brut", kind: "money" }}
            line={{ key: "margin", label: "Ta marge", kind: "money" }}
            details={[
              { key: "conversions", label: "Conversions", kind: "count" },
              { key: "clicks", label: "Clics", kind: "count" },
              { key: "active", label: "Affiliés actifs", kind: "count" },
            ]}
            ranges={[7, 30, 90]}
            defaultRange={30}
          />
        </Section>

        <Section
          title="Tes meilleurs affiliés"
          description="Ce mois-ci, par CA brut."
          action={
            <Link
              href="/admin/affiliates"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Tous
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
          className="lg:col-span-4"
          flush
        >
          {top.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted-foreground">
              Aucune activité ce mois-ci pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {top.slice(0, 6).map((row) => (
                <li key={row.publisherId}>
                  <Link
                    href={`/admin/affiliates/${row.publisherId}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                  >
                    <Initials name={row.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium">{row.name}</p>
                        <p className="num shrink-0 text-sm font-semibold">
                          {formatCurrency(row.revenue)}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${Math.max(2, (row.revenue / leader) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        <span className="num">{formatNumber(row.conversions)}</span>{" "}
                        conv. · marge{" "}
                        <span className="num">{formatCurrency(row.margin)}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Section
          title="Dernières conversions"
          description="Sur tout le réseau, au fil de l'eau."
          action={
            <Link
              href="/admin/postback"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Journal des appels
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
          className="lg:col-span-8"
          flush
        >
          {feed.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted-foreground">
              Les conversions apparaîtront ici dès que le postback en reçoit une.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {feed.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      item.reversed ? "bg-muted-foreground/40" : "bg-success",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{item.affiliate}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.offer ?? "offre non précisée"}
                      </span>
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {formatRelative(item.at)}
                  </span>
                  <span
                    className={cn(
                      "num w-20 shrink-0 text-right text-sm",
                      item.reversed
                        ? "text-muted-foreground line-through"
                        : "font-semibold",
                    )}
                  >
                    {formatCurrency(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* The numbers arrive on their own now; what matters is knowing the
            pipes that bring them are still running. */}
        <Section
          title="Arrivée des chiffres"
          description="Les deux tuyaux qui remplissent les dashboards."
          className="lg:col-span-4"
        >
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Webhook className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Conversions · postback</p>
                <Status tone={feed.length > 0 ? "success" : "neutral"} className="mt-0.5">
                  {feed.length > 0
                    ? `Dernière reçue ${formatRelative(feed[0].at)}`
                    : "Aucune conversion reçue pour l'instant"}
                </Status>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Clics · synchro Flow</p>
                <Status
                  tone={
                    !pulse.sync.configured || syncBroken
                      ? "warning"
                      : pulse.sync.ranAt
                        ? "success"
                        : "neutral"
                  }
                  className="mt-0.5 whitespace-normal"
                >
                  {!pulse.sync.configured
                    ? "Aucune clé Flow enregistrée"
                    : syncBroken
                      ? `Échec : ${pulse.sync.error ?? "raison inconnue"}`
                      : pulse.sync.ranAt
                        ? `Relus le ${formatDateTime(pulse.sync.ranAt)}`
                        : "Aucune synchro n'a encore tourné"}
                </Status>
              </div>
            </li>
          </ul>
          <Link
            href="/admin/flow"
            className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ouvrir la synchro Flow
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Section>
      </div>
    </div>
  );
}
