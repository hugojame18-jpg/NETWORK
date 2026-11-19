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
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" aria-label="RevNetwork — accueil">
              <Logo />
            </Link>
            <nav className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground sm:justify-start">
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
          </div>

          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Send className="h-4 w-4" />
            Nous écrire sur Telegram
          </a>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} © RevNetwork. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
