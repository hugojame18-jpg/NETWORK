import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getPublisherByUserId,
  getRevenueSummary,
  getPerformanceSeries,
  getMonthlyLeaderboard,
  getActiveAnnouncements,
  getPublisherSnapshot,
} from "@/lib/data/publisher";
import { AnnouncementBanner } from "@/components/dashboard/announcement-banner";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { NextStep, EarningsHero } from "@/components/dashboard/next-step";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { PerformanceChart, type ChartSeriesConfig } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatCalendarDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Accueil" };

// Clicks and conversions live on wildly different scales from euros, so the
// home chart shows the two the affiliate steers on. The full breakdown is one
// click away in Statistiques.
const HOME_SERIES: ChartSeriesConfig[] = [
  { key: "conversions", label: "Conversions", color: "#34d399" },
  { key: "revenue", label: "Gains ($)", color: "#fbbf24" },
];

export default async function PublisherHomePage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [revenue, series, leaderboard, announcements, snapshot] = await Promise.all([
    getRevenueSummary(publisher.id),
    getPerformanceSeries(publisher.id, 30),
    getMonthlyLeaderboard(publisher.id),
    getActiveAnnouncements(),
    getPublisherSnapshot(publisher.id),
  ]);

  const recentDays = [...series]
    .reverse()
    .filter((day) => day.clicks > 0 || day.conversions > 0 || day.revenue > 0)
    .slice(0, 7);

  const firstName = (user.name ?? "").split(" ")[0];

  return (
    <div className="space-y-6">
      {publisher.onboardingSeenAt === null && <OnboardingTour />}

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Salut {firstName || "👋"}
        </h1>
        <p className="text-sm text-muted-foreground">Voici où tu en es aujourd&apos;hui.</p>
      </div>

      <AnnouncementBanner announcements={announcements} />

      <EarningsHero
        month={revenue.month}
        today={revenue.today}
        total={revenue.total}
        rate={revenue.rate}
        formatValue={formatCurrency}
      />

      <NextStep
        requestedLinks={snapshot.requestedLinks}
        deliveredLinks={snapshot.deliveredLinks}
        statDays={snapshot.statDays}
      />

      {/* Charts and tables only earn their place once there is data to show. */}
      {snapshot.statDays > 0 && (
        <>
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>30 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={series} series={HOME_SERIES} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="shadow-premium lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Tes dernières journées</CardTitle>
                  <Link
                    href="/dashboard/stats"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Tout voir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
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
                        <TableCell className="text-right">{formatNumber(day.clicks)}</TableCell>
                        <TableCell className="text-right">{formatNumber(day.conversions)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(day.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
        </>
      )}
    </div>
  );
}
