"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  icon: string;
  title: string;
  body: string;
}

/**
 * Walks a brand-new affiliate through the dashboard, in the order they'll
 * actually use it: find something to promote → get the link → watch the
 * numbers → get paid. Each step names the real menu entry so they can find it
 * again once the tour is closed.
 */
const STEPS: Step[] = [
  {
    icon: "👋",
    title: "Bienvenue sur RevNetwork",
    body: "Deux minutes pour comprendre comment tout fonctionne. Tu pourras revoir ce guide à tout moment depuis tes Paramètres.",
  },
  {
    icon: "🎯",
    title: "1. Choisis ce que tu veux promouvoir",
    body: "Dans « Offres disponibles », filtre par catégorie — CC Submit, Trial, SOI, DOI, CPA, PIN Submit — et ouvre celle qui t'intéresse. Chaque offre affiche son payout et son type de rémunération.",
  },
  {
    icon: "🖥️",
    title: "2. Ou pars d'un site tout prêt",
    body: "Dans « Sites à promouvoir », tu as un aperçu en direct de chaque site du réseau. Clique dessus pour l'ouvrir en grand, puis sur « Demander » si tu veux le promouvoir.",
  },
  {
    icon: "🔗",
    title: "3. Demande ton lien",
    body: "Sur une offre, clique « Demander mon lien ». Ta demande nous arrive, on te renvoie ton lien d'affiliation personnel — tu le retrouves ensuite dans « Mes liens », prêt à copier.",
  },
  {
    icon: "🎓",
    title: "4. Forme-toi",
    body: "L'espace « Formation » regroupe nos vidéos : générer du trafic, choisir ses angles, convertir. Si tu débutes, commence par là avant de lancer une campagne.",
  },
  {
    icon: "📊",
    title: "5. Suis tes résultats",
    body: "« Statistiques » affiche tes clics, conversions et revenus jour par jour. Ces chiffres sont saisis chaque soir par l'équipe : ce sont les mêmes que ceux qui servent à te payer.",
  },
  {
    icon: "🎁",
    title: "6. Débloque des récompenses",
    body: "Plus tu génères de revenus, plus tu montes : paliers avec bonus de payout, badges, et des lots concrets — bonus cash, AirPods, Apple Watch, iPhone… Parraine aussi des affiliés pour toucher 5 % de leurs revenus.",
  },
  {
    icon: "💰",
    title: "7. Demande ton paiement",
    body: "Renseigne ta méthode de paiement dans « Profil », puis demande ton virement depuis « Paiements » dès que tu atteins le minimum.",
  },
  {
    icon: "💬",
    title: "Une question ?",
    body: "Écris à @solangerev sur Telegram. On répond vite — et on préfère largement une question de trop qu'un affilié bloqué.",
  },
];

export function OnboardingTour() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  function finish() {
    setDismissed(true);
    startTransition(async () => {
      // Best effort: if this fails the tour simply shows again next time,
      // which is far better than blocking the dashboard behind an error.
      await fetch("/api/publisher/onboarding", { method: "POST" }).catch(() => {});
      router.refresh();
    });
  }

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {step.icon}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">
                Étape {index + 1} sur {STEPS.length}
              </p>
              <h2 className="text-lg font-semibold">{step.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            aria-label="Passer le guide"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border p-4">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-primary" : i < index ? "w-1.5 bg-primary/50" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIndex((i) => i - 1)}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish} disabled={isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                C&apos;est parti
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
                Suivant
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
