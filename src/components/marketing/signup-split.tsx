"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The closing call to action.
 *
 * It used to be split in two, Publisher on one side and Advertiser on the
 * other. The network has no advertiser side to sign up for, so there is one
 * door now, and it leads somewhere.
 */
export function SignupSplit() {
  return (
    <section id="join" className="relative">
      {/* Scrolling watermark strip — pauses on hover (see `.marquee-group` rule). */}
      <div className="marquee-group relative overflow-hidden border-t border-border bg-background py-24">
        <div className="flex -rotate-3 flex-col gap-2 opacity-[0.06]">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="animate-marquee flex w-max"
              style={{
                animationDuration: `${26 + row * 8}s`,
                animationDirection: row % 2 === 1 ? "reverse" : "normal",
              }}
            >
              <span className="pr-4 text-5xl font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-7xl">
                {"Rejoindre · ".repeat(10)}
              </span>
              <span
                aria-hidden
                className="pr-4 text-5xl font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-7xl"
              >
                {"Rejoindre · ".repeat(10)}
              </span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt à envoyer ton premier clic ?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Compte gratuit, dashboard ouvert tout de suite, 50 % de chaque
            conversion.
          </p>
          <Button
            size="lg"
            className="pointer-events-auto h-12 px-8 text-base"
            render={<Link href="/sign-up" />}
          >
            Créer mon compte
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
