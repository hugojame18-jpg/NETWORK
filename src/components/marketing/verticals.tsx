"use client";

import { motion } from "framer-motion";

interface Vertical {
  name: string;
  items: string[];
  description: string;
  categories: string;
  traffic: string;
}

const VERTICALS: Vertical[] = [
  {
    name: "Sweepstakes",
    items: ["CC Submit", "SOI, DOI", "Pin Flow"],
    description:
      "Les sweepstakes figurent parmi les niches les plus rentables de l'affiliation aujourd'hui : des offres de jeux-concours où les gagnants sont tirés au sort.",
    categories: "CPA, SOI, DOI, Pin Flow",
    traffic: "Social Media, Google Ads, Display, Pops, Native, Email, Push",
  },
  {
    name: "VOD",
    items: ["Sport streaming", "Films & séries", "Fitness", "E-books & téléchargement"],
    description:
      "Les services de Vidéo à la Demande sont des plateformes sur lesquelles les utilisateurs s'abonnent au mois pour accéder à différents contenus en streaming.",
    categories: "Sport, films & TV, fitness, e-books, téléchargement",
    traffic: "Facebook & réseaux sociaux, Messenger, Email, SMS, SEO",
  },
];

function VerticalBlock({ vertical, index }: { vertical: Vertical; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="grid gap-8 lg:grid-cols-2"
    >
      <div>
        <h3 className="text-2xl font-bold tracking-tight uppercase">{vertical.name}</h3>
        <div className="mt-6 border-t border-primary/40 pt-6">
          <ol className="relative space-y-6 pl-6">
            <span className="absolute top-1 bottom-1 left-[3px] w-px bg-border" aria-hidden />
            {vertical.items.map((item) => (
              <li key={item} className="relative text-sm text-muted-foreground">
                <span className="absolute top-1.5 -left-6 h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">{vertical.description}</p>
        <p>
          <span className="font-semibold">Catégories&nbsp;:</span>{" "}
          <span className="text-muted-foreground">{vertical.categories}</span>
        </p>
        <p>
          <span className="font-semibold">Sources de trafic&nbsp;:</span>{" "}
          <span className="text-muted-foreground">{vertical.traffic}</span>
        </p>
      </div>
    </motion.div>
  );
}

export function Verticals() {
  return (
    <section id="verticals" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-14 text-right text-3xl font-bold tracking-widest text-muted-foreground/25 uppercase sm:text-4xl">
          Verticales
        </p>

        <div className="space-y-20">
          {VERTICALS.map((vertical, i) => (
            <VerticalBlock key={vertical.name} vertical={vertical} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
