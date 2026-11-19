import Link from "next/link";
import { Send } from "lucide-react";
import { Logo } from "@/components/brand/logo-mark";
import { SUPPORT_TELEGRAM } from "@/lib/contact";

/* Every link here goes somewhere. The footer used to carry a privacy link
   that 404'd and three social icons pointing at "#". */
const LINKS = [
  { label: "Comment ça marche", href: "/#how" },
  { label: "Ton dashboard", href: "/#why" },
  { label: "L'offre", href: "/#offer" },
  { label: "FAQ", href: "/#faq" },
  { label: "Confidentialité", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link href="/" aria-label="RevNetwork — accueil">
              <Logo />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Le réseau d&apos;affiliation CC Submit où tu vois chaque
              conversion et ce qu&apos;elle te rapporte.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-muted-foreground sm:grid-cols-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-white/12 px-5 text-sm font-medium transition-colors hover:border-signal hover:text-signal"
          >
            <Send className="h-4 w-4" />
            Nous écrire sur Telegram
          </a>
        </div>

        <p className="mt-14 border-t border-white/8 py-6 text-sm text-muted-foreground">
          {new Date().getFullYear()} © RevNetwork. Tous droits réservés.
        </p>
      </div>

      {/* The name, once, as large as the page allows — cut by the bottom edge
          so it reads as a signature rather than as a banner. */}
      <p
        className="display text-outline pointer-events-none -mb-[0.16em] text-center text-[15.4vw] leading-none whitespace-nowrap select-none"
        aria-hidden
      >
        RevNetwork
      </p>
    </footer>
  );
}
