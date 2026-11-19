"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MascotFull, type MascotPose } from "@/components/brand/mascot";

interface Step {
  /** What the fox does while this step is on screen. */
  pose: MascotPose;
  title: string;
  body: string;
}

/**
 * Walks a brand-new affiliate through the dashboard, in the order they'll
 * actually use it: get the link → watch the numbers → get paid. Each step
 * names the real menu entry so they can find it again once the tour is
 * closed — which is why picking an offer is no longer among them: that
 * happens off the dashboard now.
 */
const STEPS: Step[] = [
  {
    pose: "wave",
    title: "Bienvenue sur RevNetwork",
    body: "Deux minutes pour comprendre comment tout fonctionne. Tu pourras revoir ce guide à tout moment depuis tes Paramètres.",
  },
  {
    pose: "sit",
    title: "1. Récupère ton lien",
    body: "C'est l'équipe qui te remet ton lien d'affiliation, déjà configuré à ton nom. Tu n'as rien à demander depuis le dashboard : écris-nous et on te l'envoie.",
  },
  {
    pose: "sit",
    title: "2. Forme-toi",
    body: "L'espace « Formation » regroupe nos vidéos : générer du trafic, choisir ses angles, convertir. Si tu débutes, commence par là avant de lancer une campagne.",
  },
  {
    pose: "sit",
    title: "3. Suis tes résultats",
    body: "« Statistiques » affiche tes clics, conversions et revenus jour par jour. Chaque conversion validée remonte toute seule : ce sont les mêmes chiffres que ceux qui servent à te payer.",
  },
  {
    pose: "cheer",
    title: "4. Débloque des récompenses",
    body: "Plus tu génères de revenus, plus tu montes : paliers avec bonus de payout, badges, et des lots concrets — bonus cash, AirPods, Apple Watch, iPhone… Parraine aussi des affiliés pour toucher 10 % du chiffre d'affaires qu'ils génèrent.",
  },
  {
    pose: "coin",
    title: "5. Demande ton paiement",
    body: "Renseigne ta méthode de paiement dans « Profil », puis demande ton virement depuis « Paiements » dès que tu atteins le minimum.",
  },
  {
    pose: "wave",
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
      await fetch("/api/publisher/onboarding", { method: "POST" }).catch(
        () => {},
      );
      router.refresh();
    });
  }

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <MascotFull pose={step.pose} className="h-20 w-auto shrink-0" />
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
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border p-4">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-primary"
                    : i < index
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {index > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIndex((i) => i - 1)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
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
