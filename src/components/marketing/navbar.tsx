"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo-mark";

// "/#…" rather than "#…", so the links still work from the privacy page.
const NAV_LINKS = [
  { href: "/#how", label: "Comment ça marche" },
  { href: "/#why", label: "Ton dashboard" },
  { href: "/#offer", label: "L'offre" },
  { href: "/#faq", label: "FAQ" },
];

/** The same mark and name as inside the app: one brand, not two. */
function Wordmark() {
  return (
    <Link href="/" aria-label="RevNetwork — accueil">
      <Logo />
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        // Solid enough to stay legible over the light sections: the glass
        // version turned grey over white and washed the links out.
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Wordmark />

        <nav className="hidden items-center gap-8 text-sm font-medium whitespace-nowrap text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Connexion
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center rounded-full bg-signal px-4 text-sm font-semibold text-signal-foreground transition-transform hover:scale-[1.03]"
          >
            Créer mon compte
          </Link>
        </div>

        <button
          className="text-foreground lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="glass border-t px-6 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" render={<Link href="/sign-in" />}>
                Connexion
              </Button>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-full bg-signal px-4 text-sm font-semibold text-signal-foreground"
              >
                Créer mon compte
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
