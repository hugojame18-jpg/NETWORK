import type { Metadata } from "next";
import { after } from "next/server";
import {
  BarChart3,
  Globe,
  MousePointerClick,
  Percent,
  Target,
  Wallet,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { maybeSyncFlowTraffic } from "@/lib/flow";
import {
  getPublisherByUserId,
  getStatsForPeriod,
  resolveStatsPeriod,
  type StatsPeriodPreset,
} from "@/lib/data/publisher";
import { pctChange } from "@/lib/trend";
import { StatsPeriodSelector } from "@/components/dashboard/stats-period-selector";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PeriodChart } from "@/components/dashboard/period-chart";
import { Money, Section, StatTile } from "@/components/dashboard/kit";
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
} from "@/lib/format";

export const metadata: Metadata = { title: "Statistiques" };

const VALID_PRESETS: StatsPeriodPreset[] = [
  "today",
  "yesterday",
  "this_week",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "this_year",
  "full_year",
  "custom",
];

const DAY_MS = 86_400_000;

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function PublisherStatsPage({ searchParams }: PageProps) {
  const user = await requireRole("PUBLISHER");

  // Someone is looking at their traffic right now. Refresh it from Flow once
  // the page has been sent — throttled, so opening the page repeatedly costs
  // nothing, and never blocking the render if Flow is slow or down.
  after(maybeSyncFlowTraffic);
  const publisher = await getPublisherByUserId(user.id);
  const params = await searchParams;

  const period = (
    VALID_PRESETS.includes(params.period as StatsPeriodPreset)
      ? params.period
      : "last_30_days"
  ) as StatsPeriodPreset;
  const from = params.from ?? "";
  const to = params.to ?? "";

  const { start, end } = resolveStatsPeriod(period, from, to);

  // The same number of days, immediately before: what "+12 %" is measured
  // against. A period compared with a longer or shorter one says nothing.
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
  const previousEnd = new Date(start.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * DAY_MS);

  const [{ rows, totals }, { totals: before }] = await Promise.all([
    getStatsForPeriod(publisher.id, start, end),
    getStatsForPeriod(publisher.id, previousStart, previousEnd),
  ]);

  // The chart reads the same rows as the table below, so the two can never
  // disagree; it just needs the calendar day as a plain string.
  const points = rows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    clicks: row.clicks,
    hosts: row.hosts,
    conversions: row.conversions,
    revenue: row.revenue,
  }));

  const comparedWith =
    days === 1 ? "par rapport à la veille" : `par rapport aux ${days} jours d'avant`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        description={`Ton trafic et ce qu'il t'a rapporté. Les variations sont mesurées ${comparedWith}.`}
        action={<StatsPeriodSelector period={period} from={from} to={to} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label="Tes gains"
          value={<Money value={totals.revenue} />}
          delta={pctChange(totals.revenue, before.revenue)}
          icon={<Wallet />}
          className="sm:col-span-2 xl:col-span-1"
        />
        <StatTile
          label="Clics"
          value={<span className="num">{formatNumber(totals.clicks)}</span>}
          delta={pctChange(totals.clicks, before.clicks)}
          icon={<MousePointerClick />}
        />
        <StatTile
          label="Visiteurs uniques"
          value={<span className="num">{formatNumber(totals.hosts)}</span>}
          delta={pctChange(totals.hosts, before.hosts)}
          icon={<Globe />}
        />
        <StatTile
          label="Conversions"
          value={<span className="num">{formatNumber(totals.conversions)}</span>}
          delta={pctChange(totals.conversions, before.conversions)}
          icon={<Target />}
        />
        <StatTile
          label="Taux de conversion"
          value={<span className="num">{formatPercent(totals.conversionRate)}</span>}
          delta={pctChange(totals.conversionRate, before.conversionRate)}
          icon={<Percent />}
        />
      </div>

      {points.length > 0 && (
        <Section
          title="Évolution sur la période"
          description="Choisis ce que tu veux suivre : un chiffre à la fois, pour le lire sans le comparer à une autre échelle."
        >
          <PeriodChart data={points} />
        </Section>
      )}

      <Section title="Détail par jour" flush>
        {rows.length === 0 ? (
          <EmptyState
            icon={<BarChart3 />}
            title="Rien sur cette période"
            description="Aucune activité entre ces deux dates. Essaie une période plus large."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Date</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Taux</TableHead>
                <TableHead className="pr-5 text-right">Tes gains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...rows].reverse().map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-5 font-medium">
                    {formatCalendarDate(row.date)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatNumber(row.clicks)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                    {formatNumber(row.hosts)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatNumber(row.conversions)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                    {row.clicks > 0
                      ? formatPercent((row.conversions / row.clicks) * 100)
                      : "—"}
                  </TableCell>
                  <TableCell className="num pr-5 text-right font-semibold">
                    {formatCurrency(row.revenue)}
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
                <TableCell className="num hidden text-right font-semibold sm:table-cell">
                  {formatPercent(totals.conversionRate)}
                </TableCell>
                <TableCell className="num pr-5 text-right font-semibold">
                  {formatCurrency(totals.revenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}
