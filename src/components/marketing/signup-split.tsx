"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const BLOCKS = [
  {
    role: "Publisher",
    tagline: "Votre aventure commence ici.",
    className: "bg-indigo-600",
  },
  {
    role: "Advertiser",
    tagline: "Laissez-nous venir à vous.",
    className: "bg-sky-500",
  },
];

export function SignupSplit() {
  return (
    <section id="join" className="relative">
      <div className="grid sm:grid-cols-2">
        {BLOCKS.map((block, i) => (
          <motion.div
            key={block.role}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`${block.className} flex flex-col items-center justify-center px-6 py-20 text-center text-white`}
          >
            <h3 className="text-2xl font-bold tracking-tight uppercase">{block.role}</h3>
            <p className="mt-3 text-sm text-white/90">{block.tagline}</p>
            <Button
              size="lg"
              className="mt-6 h-11 w-40 bg-white text-neutral-900 hover:bg-white/90"
              render={<Link href="/sign-up" />}
            >
              S&apos;inscrire
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Scrolling watermark strip — pauses on hover (see `.marquee-group` rule). */}
      <div className="marquee-group relative overflow-hidden border-t border-border bg-background py-16">
        <div className="flex -rotate-3 flex-col gap-2 opacity-[0.06]">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="animate-marquee flex w-max"
              style={{ animationDuration: `${26 + row * 8}s`, animationDirection: row % 2 === 1 ? "reverse" : "normal" }}
            >
              <span className="pr-4 text-5xl font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-7xl">
                {"S'inscrire · ".repeat(10)}
              </span>
              <span aria-hidden className="pr-4 text-5xl font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-7xl">
                {"S'inscrire · ".repeat(10)}
              </span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Button size="lg" className="pointer-events-auto h-12 px-8 text-base" render={<Link href="/sign-up" />}>
            Rejoindre RevNetwork
          </Button>
        </div>
      </div>
    </section>
  );
}
