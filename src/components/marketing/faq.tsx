"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Send } from "lucide-react";
import { MascotFull } from "@/components/brand/mascot";
import { SUPPORT_TELEGRAM } from "@/lib/contact";
import { MIN_PAYOUT_USD, dollars } from "@/lib/public-terms";
import { SectionHeading } from "./section-heading";

/**
 * Answers checked against what the product does.
 *
 * No commission percentage appears here, on purpose: the split between the
 * network and an affiliate is not public. What someone earns is answered the
 * way the dashboard answers it — in dollars, per conversion.
 */
const FAQS = [
  {
    question: "L'inscription est-elle payante ?",
    answer:
      "Non. Créer un compte est gratuit et ton dashboard est accessible tout de suite, sans validation préalable.",
  },
  {
    question: "Combien est-ce que je touche ?",
    answer:
      "Tu es payé pour chaque conversion validée. Le montant dépend de l'offre, et ton dashboard affiche directement ce qui te revient, conversion par conversion.",
  },
  {
    question: "Quand une conversion apparaît-elle ?",
    answer:
      "Dès que l'annonceur la valide : elle remonte automatiquement, sans saisie de notre part. Si l'annonceur l'annule par la suite, elle est retirée de la journée où elle avait été comptée.",
  },
  {
    question: "Comment et quand suis-je payé ?",
    answer:
      `Tu renseignes ton moyen de paiement dans ton profil — PayPal, virement bancaire, crypto ou Payoneer. Quand ton solde atteint ${dollars(MIN_PAYOUT_USD)}, tu demandes ton paiement depuis ton dashboard. Chaque versement apparaît dans ton historique.`,
  },
  {
    question: "Y a-t-il des bonus ?",
    answer:
      "Oui. Tes gains cumulés te font passer des paliers — Argent, Or, Platine — et chaque palier ajoute un bonus sur ce que tu gagnes à partir de là. Un palier atteint reste acquis.",
  },
  {
    question: "Comment fonctionne le parrainage ?",
    answer:
      "Ton code de parrainage est dans l'onglet Récompenses. Chaque affilié qui s'inscrit avec te rapporte 10 % du chiffre d'affaires qu'il génère, aussi longtemps qu'il tourne.",
  },
  {
    question: "Est-ce que je dois créer mes liens moi-même ?",
    answer:
      "Non. L'équipe te remet ton lien de tracking, déjà configuré avec ton identifiant. Tu n'as qu'à le partager.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Les questions qu'on nous pose"
            description="Ce qu'il faut savoir avant d'envoyer ton premier clic."
          />
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-full border border-white/14 px-6 text-sm font-medium transition-colors hover:border-signal hover:text-signal"
          >
            <Send className="h-4 w-4" />
            Une autre question ? Écris-nous sur Telegram
          </a>
          <MascotFull className="mt-12 hidden h-52 w-auto lg:block" />
        </div>

        <Accordion className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="font-display py-6 text-left text-lg font-bold tracking-tight">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-[15px] leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
