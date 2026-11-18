import Link from "next/link";
import { ArrowRight, Layers, Link2, Rocket } from "lucide-react";

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
export function NextStep({
  requestedLinks,
  deliveredLinks,
  statDays,
}: NextStepProps) {
  // Once the numbers are flowing there is no "next step" to push.
  if (statDays > 0) return null;

  const step =
    requestedLinks === 0
      ? {
          icon: Layers,
          order: 1,
          title: "Choisis ta première offre",
          body: "Parcours les offres disponibles et demande ton lien sur celle qui t'intéresse. On te le renvoie rapidement.",
          href: "/dashboard/offers",
          cta: "Voir les offres",
        }
      : deliveredLinks === 0
        ? {
            icon: Link2,
            order: 2,
            title: "Ta demande est en cours",
            body: "On prépare ton lien d'affiliation. Dès qu'il est prêt tu le retrouves dans « Mes liens », et tu reçois une notification.",
            href: "/dashboard/links",
            cta: "Voir mes liens",
          }
        : {
            icon: Rocket,
            order: 3,
            title: "Ton lien est prêt — lance ton trafic",
            body: "Copie ton lien et commence à l'envoyer. Tes clics et tes conversions apparaîtront ici chaque jour.",
            href: "/dashboard/links",
            cta: "Copier mon lien",
          };

  const Icon = step.icon;

  return (
    <div className="surface relative overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="h-[20px] w-[20px]" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {/* The step counter turns three disconnected screens into one path. */}
          <p className="eyebrow">Étape {step.order} sur 3</p>
          <p className="text-[17px] leading-snug font-semibold tracking-tight">
            {step.title}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </p>

          <div className="flex items-center gap-1.5 pt-1" aria-hidden>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1 rounded-full transition-all ${
                  n === step.order
                    ? "w-7 bg-primary"
                    : n < step.order
                      ? "w-4 bg-primary/40"
                      : "w-4 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <Link
          href={step.href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
        >
          {step.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * The headline block of the affiliate home: what they earned, stated plainly,
 * with the split spelled out so nobody has to ask why the figure differs from
 * the gross they saw on the offer.
 */
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
    <div className="surface-brand relative overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Tes gains ce mois-ci</p>
          <p className="num mt-2.5 text-[42px] leading-none font-semibold sm:text-[48px]">
            {formatValue(month)}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          {Math.round(rate * 100)} % de chaque conversion
        </span>
      </div>

      <div className="rule-fade my-6" />

      <div className="grid grid-cols-2 gap-6 sm:max-w-md">
        <div>
          <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
          <p className="num mt-1 text-xl font-semibold">{formatValue(today)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Depuis le début</p>
          <p className="num mt-1 text-xl font-semibold">{formatValue(total)}</p>
        </div>
      </div>
    </div>
  );
}
