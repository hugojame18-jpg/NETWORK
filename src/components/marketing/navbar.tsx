"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#verticals", label: "Verticales" },
  { href: "#why", label: "Pourquoi nous" },
  { href: "#join", label: "Contact" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center text-2xl font-extrabold tracking-tight lowercase">
      rev
      <span className="text-primary">.</span>
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
        scrolled ? "glass border-b" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Wordmark />

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Connexion
          </Link>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" render={<Link href="/sign-up" />}>
            S&apos;inscrire
          </Button>
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="glass border-t px-6 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" render={<Link href="/sign-in" />}>
                Connexion
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700" render={<Link href="/sign-up" />}>
                S&apos;inscrire
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
