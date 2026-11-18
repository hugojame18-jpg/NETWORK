import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BanknoteArrowUp,
  BarChart3,
  RefreshCw,
  Target,
  Unplug,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";
import { getAdminPulse, getNetworkSeries } from "@/lib/data/admin";
import {
  PerformanceChart,
  type ChartSeriesConfig,
} from "@/components/dashboard/performance-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { Metric } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Pilotage" };

// Today's money and what is waiting: never a cached answer.
export const dynamic = "force-dynamic";

// Counts on the left, money on the right — on one shared axis a day worth
// 300 $ flattens eleven conversions onto the baseline.
const NETWORK_SERIES: ChartSeriesConfig[] = [
  { key: "clicks", label: "Clics", color: "var(--chart-3)", fill: false },
  {
    key: "conversions",
    label: "Conversions",
    color: "var(--chart-4)",
    fill: false,
  },
  {
    key: "revenue",
    label: "CA brut ($)",
    color: "var(--chart-1)",
    axis: "right",
  },
];

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
          {waiting ? waitingText : idleText}
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
    getNetworkSeries(90),
  ]);

  const toDo =
    pulse.owedCount +
    pulse.pendingPayments +
    pulse.unknownSub3.length +
    pulse.rejectedHits;

  const syncBroken = pulse.sync.configured && pulse.sync.ok === false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pilotage"
        description="L'état du réseau aujourd'hui, et ce qui attend après toi."
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
          hint={
            pulse.today.clicks > 0
              ? `sur ${formatNumber(pulse.today.clicks)} clics`
              : undefined
          }
          icon={<Target />}
        />
        <Metric
          label="Affiliés"
          value={formatNumber(pulse.publisherCount)}
          hint={`${formatNumber(pulse.activeToday)} actif${pulse.activeToday > 1 ? "s" : ""} aujourd'hui`}
          icon={<Users />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>À traiter</CardTitle>
            <p className="text-xs text-muted-foreground">
              {toDo === 0 ? "Tout est à jour 👌" : "Du plus coûteux au moins"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Pending
            href="/admin/affiliates"
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
        </CardContent>
      </Card>

      {/* The numbers arrive on their own now; what matters is knowing the
          pipe that brings them is still running. */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                syncBroken || !pulse.sync.configured
                  ? "bg-warning/15 text-warning"
                  : "bg-primary/12 text-primary"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Arrivée des chiffres</p>
              <p className="text-sm text-muted-foreground">
                {!pulse.sync.configured
                  ? "Les conversions arrivent par postback. Les clics ne remontent pas : aucune clé Flow enregistrée."
                  : syncBroken
                    ? `La dernière synchro des clics a échoué : ${pulse.sync.error ?? "raison inconnue"}`
                    : pulse.sync.ranAt
                      ? `Conversions en direct par postback · clics relus chez Flow le ${formatDateTime(pulse.sync.ranAt)}.`
                      : "Conversions en direct par postback · aucune synchro des clics n'a encore tourné."}
              </p>
            </div>
          </div>
          <Link
            href="/admin/flow"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Synchro Flow
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
          <PerformanceChart data={series} series={NETWORK_SERIES} />
        </CardContent>
      </Card>
    </div>
  );
}
