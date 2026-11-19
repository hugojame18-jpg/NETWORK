"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SUPPORT_TELEGRAM } from "@/lib/contact";
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
      "Tu renseignes ton moyen de paiement dans ton profil — PayPal, virement bancaire, crypto ou Payoneer. Quand ton solde atteint le minimum de retrait indiqué dans ton dashboard, tu demandes ton paiement. Chaque versement apparaît dans ton historique.",
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
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Ce qu'il faut savoir avant de commencer."
        />

        <div className="mt-12">
          <Accordion className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Une autre question ?{" "}
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Écris-nous sur Telegram
          </a>
          .
        </p>
      </div>
    </section>
  );
}
