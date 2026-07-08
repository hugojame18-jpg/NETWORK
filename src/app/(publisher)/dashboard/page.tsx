import type { Metadata } from "next";
import { CalendarDays, CalendarRange, Wallet, TrendingUp } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getRevenueSummary, getPerformanceSeries, getMonthlyLeaderboard } from "@/lib/data/publisher";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { PerformanceChart, type ChartSeriesConfig } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatCalendarDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

const DAILY_STAT_SERIES: ChartSeriesConfig[] = [
  { key: "clicks", label: "Clics", color: "#818cf8" },
  { key: "hosts", label: "Hosts", color: "#38bdf8" },
  { key: "conversions", label: "Conversions", color: "#34d399" },
  { key: "revenue", label: "Revenus ($)", color: "#fbbf24" },
];

function pctDelta(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function PublisherOverviewPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [revenue, series, leaderboard] = await Promise.all([
    getRevenueSummary(publisher.id),
    getPerformanceSeries(publisher.id, 90),
    getMonthlyLeaderboard(publisher.id),
  ]);

  const recentDays = [...series].reverse().filter((d) => d.clicks > 0 || d.conversions > 0 || d.revenue > 0).slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenus aujourd'hui"
          value={revenue.today}
          prefix="$"
          decimals={2}
          icon={<Wallet />}
          delta={pctDelta(revenue.today, revenue.yesterday)}
          index={0}
        />
        <StatCard label="Revenus hier" value={revenue.yesterday} prefix="$" decimals={2} icon={<CalendarDays />} index={1} />
        <StatCard label="Revenus du mois" value={revenue.month} prefix="$" decimals={2} icon={<CalendarRange />} index={2} />
        <StatCard label="Revenus totaux" value={revenue.total} prefix="$" decimals={2} icon={<TrendingUp />} index={3} />
      </div>

      <PerformanceChart data={series} series={DAILY_STAT_SERIES} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-premium lg:col-span-3">
          <CardHeader>
            <CardTitle>Dernières journées renseignées</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Revenus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDays.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{formatCalendarDate(day.date)}</TableCell>
                    <TableCell className="text-right">{formatNumber(day.clicks)}</TableCell>
                    <TableCell className="text-right">{formatNumber(day.conversions)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(day.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recentDays.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune statistique n&apos;a encore été renseignée pour votre compte.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <TopPerformers
            periodLabel={leaderboard.periodLabel}
            top={leaderboard.top}
            me={leaderboard.me}
            totalRanked={leaderboard.totalRanked}
          />
        </div>
      </div>
    </div>
  );
}
