import type { Metadata } from "next";
import { MousePointerClick, Globe, Target, Percent, Wallet } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getStatsForPeriod, resolveStatsPeriod, type StatsPeriodPreset } from "@/lib/data/publisher";
import { StatsPeriodSelector } from "@/components/dashboard/stats-period-selector";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const period = (VALID_PRESETS.includes(params.period as StatsPeriodPreset) ? params.period : "last_30_days") as StatsPeriodPreset;
  const from = params.from ?? "";
  const to = params.to ?? "";

  const { start, end } = resolveStatsPeriod(period, from, to);
  const { rows, totals } = await getStatsForPeriod(publisher.id, start, end);

  return (
    <div className="space-y-6">
      <StatsPeriodSelector period={period} from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Clics" value={totals.clicks} icon={<MousePointerClick />} index={0} />
        <StatCard label="Hosts" value={totals.hosts} icon={<Globe />} index={1} />
        <StatCard label="Conversions" value={totals.conversions} icon={<Target />} index={2} />
        <StatCard label="Taux de conversion" value={totals.conversionRate} suffix="%" decimals={2} icon={<Percent />} index={3} />
        <StatCard label="Revenus" value={totals.revenue} prefix="$" decimals={2} icon={<Wallet />} index={4} />
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Détail par jour</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                  <TableCell className="text-right">{formatNumber(row.clicks)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.hosts)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.conversions)}</TableCell>
                  <TableCell className="text-right">
                    {row.clicks > 0 ? `${((row.conversions / row.clicks) * 100).toFixed(2)}%` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Aucune statistique renseignée pour cette période.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
