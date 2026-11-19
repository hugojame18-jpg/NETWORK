import type { Metadata } from "next";
import Link from "next/link";
import { Coins, Target, TrendingUp, Users } from "lucide-react";
import {
  getNetworkRevenue,
  getRevenueByPublisher,
  getRevenueSeries,
  resolvePeriod,
  type RevenuePeriod,
} from "@/lib/data/admin";
import { conversionRate } from "@/lib/trend";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CustomRangeForm } from "@/components/dashboard/admin/custom-range-form";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Money,
  Person,
  Section,
  StatTile,
} from "@/components/dashboard/kit";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Chiffre d'affaires" };

export const dynamic = "force-dynamic";

const PRESETS: { value: RevenuePeriod; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "month", label: "Ce mois" },
  { value: "last-month", label: "Mois dernier" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Depuis le début" },
];

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function AdminRevenuePage({ searchParams }: PageProps) {
  const { period, from, to } = await searchParams;
  const active = (
    PRESETS.some((p) => p.value === period) ? period : "30d"
  ) as RevenuePeriod;
  const isCustom = Boolean(from || to);

  const range = resolvePeriod(active, from, to);
  const allTime = resolvePeriod("all");

  const [totals, lifetime, byPublisher, series] = await Promise.all([
    getNetworkRevenue(range),
    getNetworkRevenue(allTime),
    getRevenueByPublisher(range),
    getRevenueSeries(range),
  ]);

  const marginShare = totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chiffre d'affaires"
        description="Ce que le réseau encaisse, ce qui part aux affiliés, et ce qu'il te reste."
      />

      {/* The lifetime figure sits apart: it is the one number that never
          depends on the period chosen below. */}
      <div className="surface-brand grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Ta marge depuis le début</p>
          <p className="mt-3 text-[44px] leading-none font-semibold tracking-tight">
            <Money value={lifetime.margin} />
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            sur{" "}
            <span className="num font-medium text-foreground">
              {formatCurrency(lifetime.revenue)}
            </span>{" "}
            de CA brut, dont{" "}
            <span className="num font-medium text-foreground">
              {formatCurrency(lifetime.affiliateShare)}
            </span>{" "}
            reversés aux affiliés.
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Conversions</dt>
            <dd className="num mt-1 text-lg font-semibold">
              {formatNumber(lifetime.conversions)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Clics</dt>
            <dd className="num mt-1 text-lg font-semibold">
              {formatNumber(lifetime.clicks)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Jours d&apos;activité</dt>
            <dd className="num mt-1 text-lg font-semibold">
              {formatNumber(lifetime.daysWithData)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <nav
          aria-label="Période"
          className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
        >
          {PRESETS.map((preset) => {
            const selected = !isCustom && active === preset.value;
            return (
              <Link
                key={preset.value}
                href={`/admin/revenue?period=${preset.value}`}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {preset.label}
              </Link>
            );
          })}
        </nav>
        <CustomRangeForm from={from} to={to} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Ta marge"
          value={<Money value={totals.margin} />}
          hint={`${formatPercent(marginShare)} du CA brut`}
          icon={<Coins />}
        />
        <StatTile
          label="CA brut"
          value={<Money value={totals.revenue} />}
          hint={range.label.toLowerCase()}
          icon={<TrendingUp />}
        />
        <StatTile
          label="Reversé aux affiliés"
          value={<Money value={totals.affiliateShare} />}
          hint={`${formatNumber(byPublisher.length)} affilié${byPublisher.length > 1 ? "s" : ""} sur la période`}
          icon={<Users />}
        />
        <StatTile
          label="Conversions"
          value={<span className="num">{formatNumber(totals.conversions)}</span>}
          hint={`${formatPercent(conversionRate(totals.conversions, totals.clicks))} de ${formatNumber(totals.clicks)} clics`}
          icon={<Target />}
        />
      </div>

      <Section
        title="Jour par jour"
        description={
          range.from
            ? `Du ${formatCalendarDate(range.from)} au ${formatCalendarDate(new Date(range.to.getTime() - 1))}.`
            : "Depuis la première journée enregistrée."
        }
      >
        {series.length > 0 ? (
          <TrendChart
            data={series}
            bars={{ key: "revenue", label: "CA brut", kind: "money" }}
            details={[
              { key: "conversions", label: "Conversions", kind: "count" },
              { key: "clicks", label: "Clics", kind: "count" },
            ]}
          />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Aucune activité sur cette période.
          </p>
        )}
      </Section>

      <Section
        title="Par affilié"
        description="Ce que chacun a fait encaisser au réseau, et ce qu'il t'en reste."
        flush
      >
        {byPublisher.length === 0 ? (
          <p className="px-5 pb-10 pt-4 text-center text-sm text-muted-foreground">
            Aucun affilié n&apos;a d&apos;activité sur cette période.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Affilié</TableHead>
                <TableHead className="hidden text-right md:table-cell">Clics</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead className="text-right">CA brut</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Taux</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Sa part</TableHead>
                <TableHead className="pr-5 text-right">Ta marge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byPublisher.map((row) => (
                <TableRow key={row.publisherId}>
                  <TableCell className="pl-5">
                    <Link href={`/admin/affiliates/${row.publisherId}`} className="block">
                      <Person name={row.name} detail={`#${row.memberId} · ${row.email}`} />
                    </Link>
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground md:table-cell">
                    {formatNumber(row.clicks)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatNumber(row.conversions)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground lg:table-cell">
                    {Math.round(row.rate * 100)} %
                  </TableCell>
                  <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                    {formatCurrency(row.affiliateShare)}
                  </TableCell>
                  <TableCell className="num pr-5 text-right font-semibold">
                    {formatCurrency(row.margin)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell className="pl-5 font-semibold">Total</TableCell>
                <TableCell className="num hidden text-right font-semibold md:table-cell">
                  {formatNumber(totals.clicks)}
                </TableCell>
                <TableCell className="num text-right font-semibold">
                  {formatNumber(totals.conversions)}
                </TableCell>
                <TableCell className="num text-right font-semibold">
                  {formatCurrency(totals.revenue)}
                </TableCell>
                <TableCell className="hidden lg:table-cell" />
                <TableCell className="num hidden text-right font-semibold sm:table-cell">
                  {formatCurrency(totals.affiliateShare)}
                </TableCell>
                <TableCell className="num pr-5 text-right font-semibold">
                  {formatCurrency(totals.margin)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}
