import type { Metadata } from "next";
import {
  BarChart3,
  MousePointerClick,
  Globe,
  Target,
  Percent,
  Wallet,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getPublisherByUserId,
  getStatsForPeriod,
  resolveStatsPeriod,
  type StatsPeriodPreset,
} from "@/lib/data/publisher";
import { StatsPeriodSelector } from "@/components/dashboard/stats-period-selector";
import { Metric } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatCalendarDate, formatNumber } from "@/lib/format";

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

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function PublisherStatsPage({ searchParams }: PageProps) {
  const user = await requireRole("PUBLISHER");
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
  const { rows, totals } = await getStatsForPeriod(publisher.id, start, end);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        description="Le détail de ton trafic, jour par jour. Les revenus affichés sont déjà ta part."
      />

      <StatsPeriodSelector period={period} from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metric
          label="Revenus"
          value={formatCurrency(totals.revenue)}
          icon={<Wallet />}
          accent
          hint="ta part, déjà calculée"
        />
        <Metric
          label="Clics"
          value={formatNumber(totals.clicks)}
          icon={<MousePointerClick />}
        />
        <Metric
          label="Hosts"
          value={formatNumber(totals.hosts)}
          icon={<Globe />}
        />
        <Metric
          label="Conversions"
          value={formatNumber(totals.conversions)}
          icon={<Target />}
        />
        <Metric
          label="Taux de conversion"
          value={`${totals.conversionRate.toFixed(2)} %`}
          icon={<Percent />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par jour</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <EmptyState
              icon={<BarChart3 />}
              title="Rien sur cette période"
              description="Aucune statistique n'a été renseignée entre ces deux dates. Essaie une période plus large."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Hosts</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Taux</TableHead>
                  <TableHead className="text-right">Revenus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatCalendarDate(row.date)}</TableCell>
                    <TableCell className="num text-right">
                      {formatNumber(row.clicks)}
                    </TableCell>
                    <TableCell className="num text-right">
                      {formatNumber(row.hosts)}
                    </TableCell>
                    <TableCell className="num text-right">
                      {formatNumber(row.conversions)}
                    </TableCell>
                    <TableCell className="num text-right text-muted-foreground">
                      {row.clicks > 0
                        ? `${((row.conversions / row.clicks) * 100).toFixed(2)} %`
                        : "—"}
                    </TableCell>
                    <TableCell className="num text-right font-medium">
                      {formatCurrency(row.revenue)}
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
