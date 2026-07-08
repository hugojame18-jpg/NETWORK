import Link from "next/link";
import { Send, Share2, AtSign } from "lucide-react";

const LINKS = [
  { label: "Verticales", href: "#verticals" },
  { label: "Pourquoi nous", href: "#why" },
  { label: "Contact", href: "#join" },
  { label: "Confidentialité", href: "/privacy" },
];

const SOCIALS = [
  { label: "Telegram", href: "#", icon: Send },
  { label: "Réseaux sociaux", href: "#", icon: Share2 },
  { label: "Email", href: "#", icon: AtSign },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-2xl font-extrabold tracking-tight lowercase">
              rev<span className="text-primary">.</span>
            </Link>
            <nav className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground sm:justify-start">
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} © RevNetwork. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
