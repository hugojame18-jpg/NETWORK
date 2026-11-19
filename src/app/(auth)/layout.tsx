import Link from "next/link";
import { ArrowLeft, Radio, Send, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/logo-mark";
import { Mascot } from "@/components/brand/mascot";
import { displayFont } from "@/lib/fonts";

/* Three things the product does, in the order an affiliate meets them. This
   panel used to open on a quoted testimonial from a named "partner" — a person
   from the development seed data, not a customer. Nothing is quoted here that
   nobody said. */
const HIGHLIGHTS = [
  {
    icon: Radio,
    title: "Tes conversions en direct",
    description:
      "Chaque conversion validée s'affiche aussitôt, avec ce qu'elle te rapporte.",
  },
  {
    icon: Wallet,
    title: "Ton solde toujours à jour",
    description:
      "Ce qui t'est dû, ce qui t'a été versé, et la distance jusqu'au prochain retrait.",
  },
  {
    icon: Send,
    title: "Une équipe à qui écrire",
    description: "Une question ? Tu écris directement à l'équipe sur Telegram.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${displayFont.variable} relative flex min-h-screen w-full`}>
      <div className="dark relative hidden w-1/2 overflow-hidden border-r border-border bg-background text-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-20 -bottom-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary), transparent 70%)",
          }}
        />

        <Link href="/" className="relative z-10" aria-label="RevNetwork — accueil">
          <Logo />
        </Link>

        <div className="relative z-10 max-w-md space-y-10">
          <Mascot className="h-24 w-24" />
          <h2 className="display text-4xl xl:text-5xl">
            Envoie ton trafic.
            <br />
            <span className="text-signal">Encaisse chaque conversion.</span>
          </h2>

          <div className="grid gap-6">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au site
        </Link>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* On a phone the dark panel is hidden, so the brand has to live
              above the form or the page is an anonymous login box. */}
          <Link
            href="/"
            className="mb-10 flex justify-center lg:hidden"
            aria-label="RevNetwork — accueil"
          >
            <Logo />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
