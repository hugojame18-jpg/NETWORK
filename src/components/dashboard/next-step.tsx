import Link from "next/link";
import { ArrowRight, Layers, Link2, Rocket, TrendingUp } from "lucide-react";

interface NextStepProps {
  requestedLinks: number;
  deliveredLinks: number;
  statDays: number;
}

/**
 * Tells a publisher the single most useful thing they can do right now.
 * A brand-new affiliate lands on a dashboard full of zeros; without this they
 * have to work out for themselves that nothing happens until they ask for a
 * link. The steps follow the real funnel: pick an offer, wait for the link,
 * send traffic, then read the numbers.
 */
export function NextStep({ requestedLinks, deliveredLinks, statDays }: NextStepProps) {
  // Once the numbers are flowing there is no "next step" to push.
  if (statDays > 0) return null;

  const step =
    requestedLinks === 0
      ? {
          icon: Layers,
          title: "Commence par choisir une offre",
          body: "Parcours les offres disponibles et clique sur « Demander mon lien » sur celle qui t'intéresse. On te renvoie ton lien personnel rapidement.",
          href: "/dashboard/offers",
          cta: "Voir les offres",
        }
      : deliveredLinks === 0
        ? {
            icon: Link2,
            title: "Ta demande est en cours",
            body: "On prépare ton lien d'affiliation. Dès qu'il est prêt tu le retrouves dans « Mes liens », et tu reçois une notification.",
            href: "/dashboard/links",
            cta: "Voir mes liens",
          }
        : {
            icon: Rocket,
            title: "Ton lien est prêt — lance ton trafic",
            body: "Copie ton lien et commence à l'envoyer. Tes clics et conversions apparaîtront ici chaque jour.",
            href: "/dashboard/links",
            cta: "Copier mon lien",
          };

  const Icon = step.icon;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{step.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
        </div>
        <Link
          href={step.href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {step.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/** Headline earnings block: what they made, stated plainly. */
export function EarningsHero({
  month,
  today,
  total,
  rate,
  formatValue,
}: {
  month: number;
  today: number;
  total: number;
  rate: number;
  formatValue: (value: number) => string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Tes gains ce mois-ci</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{formatValue(month)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Tu touches {Math.round(rate * 100)} % de chaque conversion
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-muted-foreground">Aujourd&apos;hui</p>
            <p className="mt-0.5 text-xl font-semibold">{formatValue(today)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Depuis le début</p>
            <p className="mt-0.5 text-xl font-semibold">{formatValue(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
