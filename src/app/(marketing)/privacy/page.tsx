import type { Metadata } from "next";
import { SUPPORT_TELEGRAM } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Quelles données RevNetwork enregistre sur un compte affilié, pourquoi, et comment les faire corriger ou supprimer.",
};

/**
 * What the application stores, stated as it is.
 *
 * Every line here describes something the code does — a column that exists, a
 * cookie that is set. It deliberately says nothing the product cannot be shown
 * to do, and it is not a substitute for the operator's legal notice (who runs
 * the service, under which jurisdiction), which only they can write.
 */
const SECTIONS = [
  {
    title: "Ce que nous enregistrons",
    items: [
      "Ton nom, ton adresse email et ton mot de passe. Le mot de passe est stocké sous forme hachée : personne, équipe comprise, ne peut le lire.",
      "Ce que tu indiques à l'inscription et dans ton profil : société, site web, expérience en affiliation, liens vers tes comptes.",
      "Le moyen de paiement que tu choisis et les coordonnées que tu renseignes pour être payé (adresse PayPal, IBAN, adresse de wallet ou email Payoneer).",
      "Les statistiques de ton trafic : clics, visiteurs uniques, conversions et gains, jour par jour, ainsi que l'historique de tes paiements.",
      "Si tu as été parrainé, le lien entre ton compte et celui de ton parrain.",
    ],
  },
  {
    title: "À quoi ça sert",
    items: [
      "Te donner accès à ton dashboard et sécuriser ton compte.",
      "Attribuer chaque conversion au bon affilié, calculer ce qui t'est dû et te payer.",
      "Te prévenir d'un événement sur ton compte : paiement envoyé, message de l'équipe.",
    ],
  },
  {
    title: "Cookies",
    items: [
      "Uniquement les cookies nécessaires à la connexion : ceux qui ouvrent ta session et la protègent. Pas de cookie publicitaire, pas d'outil de mesure d'audience tiers.",
    ],
  },
  {
    title: "Qui y a accès",
    items: [
      "L'équipe de RevNetwork, pour gérer ton compte et tes paiements.",
      "Nos prestataires techniques, uniquement pour faire fonctionner le service : l'hébergement du site, la base de données et l'envoi des emails.",
      "Tes données ne sont ni vendues ni cédées à des tiers à des fins commerciales. Un parrain voit le chiffre généré par ses filleuls, jamais leur identité complète ni leurs coordonnées.",
    ],
  },
  {
    title: "Tes droits",
    items: [
      "Tu peux corriger ton nom, ta société, ton site et tes coordonnées de paiement à tout moment depuis ton profil.",
      "Tu peux demander une copie de tes données, leur rectification ou la suppression de ton compte en nous écrivant. L'historique des paiements déjà effectués peut être conservé pour des raisons comptables.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-semibold tracking-wider text-primary uppercase">
        Confidentialité
      </p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">
        Ce que nous savons de toi, et pourquoi
      </h1>
      <p className="mt-4 text-muted-foreground">
        RevNetwork enregistre le strict nécessaire pour te donner un compte,
        compter tes conversions et te payer. Voici la liste, sans détour.
      </p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border p-6 text-sm">
        <p className="font-medium">Une question, une demande ?</p>
        <p className="mt-2 text-muted-foreground">
          Écris-nous sur{" "}
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Telegram
          </a>
          . Nous répondons aux demandes concernant tes données personnelles.
        </p>
      </div>
    </article>
  );
}
