"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "./section-heading";

const FAQS = [
  {
    question: "Combien coûte l'inscription sur RevNetwork ?",
    answer:
      "L'inscription est gratuite pour les publishers comme pour les annonceurs. Nous ne prenons aucune commission cachée sur vos gains : ce que vous voyez dans votre dashboard est ce que vous recevez.",
  },
  {
    question: "Comment sont calculées les commissions ?",
    answer:
      "Chaque offre définit un payout (CPA, CPL, CPS ou revenue share). Dès qu'une conversion est validée par l'annonceur, la commission correspondante est calculée automatiquement et ajoutée à votre solde.",
  },
  {
    question: "Quels moyens de paiement sont disponibles ?",
    answer:
      "PayPal, virement bancaire, Payoneer et paiement en crypto-monnaies. Vous choisissez votre méthode préférée dans les paramètres de votre compte, et suivez chaque paiement de sa demande jusqu'à son versement.",
  },
  {
    question: "Comment fonctionne la protection anti-fraude ?",
    answer:
      "Chaque clic est analysé : détection des doublons, du trafic bot, des adresses IP suspectes et des schémas de clics anormaux. Les clics identifiés comme frauduleux sont exclus du calcul des commissions.",
  },
  {
    question: "Puis-je promouvoir des offres dans plusieurs pays ?",
    answer:
      "Oui. Chaque offre précise les pays et devices autorisés. Le catalogue est filtrable pour ne vous montrer que les offres compatibles avec votre trafic.",
  },
  {
    question: "Combien de temps dure le cookie de tracking ?",
    answer:
      "La durée du cookie est définie par offre, généralement entre 7 et 30 jours. Elle est indiquée directement sur la fiche de chaque offre avant que vous ne génériez votre lien.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Tout ce qu'il faut savoir avant de commencer. Une autre question ? Notre support répond en moins de 24h."
        />

        <div className="mt-12">
          <Accordion className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
