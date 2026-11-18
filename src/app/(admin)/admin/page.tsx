import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Link2,
  MonitorSmartphone,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { getAdminPulse, getPlatformSeries } from "@/lib/data/admin";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { Metric } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Pilotage" };

/** A queue that blocks an affiliate until it is cleared. */
function Pending({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof Link2;
}) {
  const waiting = count > 0;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl border p-4 transition ${
        waiting
          ? "border-warning/40 bg-warning/8 hover:border-warning/60"
          : "border-border hover:border-primary/30 hover:bg-muted/40"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 ${
          waiting
            ? "bg-warning/15 text-warning"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {waiting ? "en attente de toi" : "rien à traiter"}
        </p>
      </div>
      <span
        className={`num text-2xl font-semibold ${waiting ? "text-warning" : "text-muted-foreground/50"}`}
      >
        {count}
      </span>
    </Link>
  );
}

export default async function AdminHomePage() {
  const [pulse, series] = await Promise.all([
    getAdminPulse(),
    getPlatformSeries(30),
  ]);

  const toDo = pulse.pendingLinks + pulse.pendingSites + pulse.pendingPayments;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pilotage"
        description="L'état du réseau aujourd'hui, et ce qui attend après toi."
        action={
          <Link
            href="/admin/stats"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Saisir les stats
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Money first: the margin is the figure the whole business turns on. */}
      <div className="surface-brand p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Ta marge ce mois-ci</p>
            <p className="num mt-2.5 text-[42px] leading-none font-semibold">
              {formatCurrency(pulse.month.margin)}
            </p>
            <p className="mt-2.5 text-sm text-muted-foreground">
              sur{" "}
              <span className="num font-medium text-foreground">
                {formatCurrency(pulse.month.revenue)}
              </span>{" "}
              de CA brut —{" "}
              <span className="num font-medium">
                {formatCurrency(pulse.month.affiliateShare)}
              </span>{" "}
              reversés aux affiliés
            </p>
          </div>
          <Link
            href="/admin/revenue"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Voir le détail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="CA aujourd'hui"
          value={formatCurrency(pulse.today.revenue)}
          icon={<BarChart3 />}
        />
        <Metric
          label="Ta marge du jour"
          value={formatCurrency(pulse.today.margin)}
          icon={<Wallet />}
        />
        <Metric
          label="Conversions du jour"
          value={formatNumber(pulse.today.conversions)}
          icon={<Target />}
        />
        <Metric
          label="Affiliés"
          value={formatNumber(pulse.publisherCount)}
          hint={`${formatNumber(pulse.activeToday)} actifs aujourd'hui`}
          icon={<Users />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>À traiter</CardTitle>
            <p className="text-xs text-muted-foreground">
              {toDo === 0
                ? "Tout est à jour 👌"
                : `${toDo} demande${toDo > 1 ? "s" : ""} en attente`}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Pending
            href="/admin/link-requests"
            label="Demandes de liens"
            count={pulse.pendingLinks}
            icon={Link2}
          />
          <Pending
            href="/admin/site-requests"
            label="Demandes de sites"
            count={pulse.pendingSites}
            icon={MonitorSmartphone}
          />
          <Pending
            href="/admin/payments"
            label="Paiements"
            count={pulse.pendingPayments}
            icon={Wallet}
          />
        </CardContent>
      </Card>

      {/* The evening ritual, surfaced where it is actually remembered. */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Saisie du jour</p>
              <p className="text-sm text-muted-foreground">
                {pulse.statsEnteredToday > 0
                  ? `${pulse.statsEnteredToday} affilié${pulse.statsEnteredToday > 1 ? "s" : ""} renseigné${
                      pulse.statsEnteredToday > 1 ? "s" : ""
                    } aujourd'hui.`
                  : "Aucun chiffre saisi aujourd'hui."}
              </p>
            </div>
          </div>
          <Link
            href="/admin/stats"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Ouvrir la saisie
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Activité du réseau</CardTitle>
            <Link
              href="/admin/affiliates"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Gérer mes affiliés
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={series} />
        </CardContent>
      </Card>
    </div>
  );
}
