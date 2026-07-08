import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Tracking en temps réel",
    description: "Clics, leads et conversions remontent en quelques millisecondes.",
  },
  {
    icon: BarChart3,
    title: "Revenus transparents",
    description: "Commissions calculées automatiquement, sans surprise en fin de mois.",
  },
  {
    icon: ShieldCheck,
    title: "Paiements fiables",
    description: "Un suivi précis de chaque paiement, du statut en attente au virement.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <div className="relative hidden w-1/2 overflow-hidden border-r border-border bg-[oklch(0.16_0.015_275)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--chart-3), transparent 70%)" }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
            CC
          </span>
          RevNetwork
        </Link>

        <div className="relative z-10 space-y-10">
          <blockquote className="max-w-md space-y-4">
            <p className="text-2xl leading-snug font-medium text-white">
              « Le réseau qui rend le tracking de nos campagnes enfin{" "}
              <span className="text-gradient-brand">lisible</span>. »
            </p>
            <footer className="text-sm text-white/50">
              Julia Chen — Chen Media Buying, publisher partenaire
            </footer>
          </blockquote>

          <div className="grid gap-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-sm text-white/50">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white"
        >
          Retour au site <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
