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
 * Answers checked against what the product does, including the one that is
 * less flattering: a referred affiliate keeps 40 %, not 50 %. Saying "50 %"
 * on the page and showing 40 % in the dashboard is the kind of surprise that
 * costs more than the sentence that prevents it.
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
      "50 % de ce que l'annonceur verse pour chaque conversion validée. Le montant affiché dans ton dashboard est déjà ta part. Une exception : si tu t'inscris avec le code d'un parrain, 10 points reviennent à ce parrain et tu gardes 40 %.",
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
      "Ton code de parrainage est dans l'onglet Récompenses. Chaque affilié qui s'inscrit avec te rapporte 10 % du chiffre d'affaires qu'il génère. Cette part est prise sur sa commission à lui, pas ajoutée par le réseau.",
  },
  {
    question: "Est-ce que je dois créer mes liens moi-même ?",
    answer:
      "Non. L'équipe te remet ton lien de tracking, déjà configuré avec ton identifiant. Tu n'as qu'à le partager.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-28">
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
