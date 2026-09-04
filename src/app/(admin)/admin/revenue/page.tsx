import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Target, MousePointerClick, CalendarDays } from "lucide-react";
import {
  getNetworkRevenue,
  getRevenueByPublisher,
  getRevenueSeries,
  resolvePeriod,
  type RevenuePeriod,
} from "@/lib/data/admin";
import { StatCard } from "@/components/dashboard/stat-card";
import { PerformanceChart, type ChartSeriesConfig } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomRangeForm } from "@/components/dashboard/admin/custom-range-form";
import { formatCurrency, formatNumber, formatCalendarDate } from "@/lib/format";

export const metadata: Metadata = { title: "Chiffre d'affaires" };

const PRESETS: { value: RevenuePeriod; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "month", label: "Ce mois" },
  { value: "last-month", label: "Mois dernier" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Depuis le début" },
];

const SERIES: ChartSeriesConfig[] = [
  { key: "revenue", label: "CA ($)", color: "#fbbf24" },
  { key: "conversions", label: "Conversions", color: "#34d399" },
  { key: "clicks", label: "Clics", color: "#818cf8" },
];

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function AdminRevenuePage({ searchParams }: PageProps) {
  const { period, from, to } = await searchParams;
  const active = (PRESETS.some((p) => p.value === period) ? period : "30d") as RevenuePeriod;
  const isCustom = Boolean(from || to);

  const range = resolvePeriod(active, from, to);
  const allTime = resolvePeriod("all");

  const [totals, lifetime, byPublisher, series] = await Promise.all([
    getNetworkRevenue(range),
    getNetworkRevenue(allTime),
    getRevenueByPublisher(range),
    getRevenueSeries(range),
  ]);

  return (
    <div className="space-y-6">
      {/* Lifetime figure sits apart: it's the one number that never depends on
          the selected period. */}
      <Card className="shadow-premium border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Chiffre d&apos;affaires depuis le début</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{formatCurrency(lifetime.revenue)}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Conversions</p>
              <p className="font-semibold">{formatNumber(lifetime.conversions)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Clics</p>
              <p className="font-semibold">{formatNumber(lifetime.clicks)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jours saisis</p>
              <p className="font-semibold">{formatNumber(lifetime.daysWithData)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <Link key={preset.value} href={`/admin/revenue?period=${preset.value}`}>
            <Badge
              variant={!isCustom && active === preset.value ? "default" : "secondary"}
              className="cursor-pointer px-3 py-1"
            >
              {preset.label}
            </Badge>
          </Link>
        ))}
        <CustomRangeForm from={from} to={to} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={`CA — ${range.label}`} value={totals.revenue} prefix="$" decimals={2} icon={<TrendingUp />} index={0} />
        <StatCard label="Conversions" value={totals.conversions} icon={<Target />} index={1} />
        <StatCard label="Clics" value={totals.clicks} icon={<MousePointerClick />} index={2} />
        <StatCard label="Jours avec données" value={totals.daysWithData} icon={<CalendarDays />} index={3} />
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Évolution — {range.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {series.length > 0 ? (
            <PerformanceChart data={series} series={SERIES} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune statistique saisie sur cette période.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Par affilié — {range.label}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Affilié</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Part</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byPublisher.map((row) => (
                <TableRow key={row.publisherId}>
                  <TableCell className="font-mono text-sm text-muted-foreground">#{row.memberId}</TableCell>
                  <TableCell>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(row.clicks)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.conversions)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {totals.revenue > 0 ? `${Math.round((row.revenue / totals.revenue) * 100)} %` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {byPublisher.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Aucun affilié n&apos;a de statistiques sur cette période.
            </p>
          )}
        </CardContent>
      </Card>

      {range.from && (
        <p className="text-xs text-muted-foreground">
          Période analysée : du {formatCalendarDate(range.from)} au{" "}
          {formatCalendarDate(new Date(range.to.getTime() - 1))}.
        </p>
      )}
    </div>
  );
}
