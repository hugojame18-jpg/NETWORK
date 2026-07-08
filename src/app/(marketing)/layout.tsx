import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  // The public landing is ALWAYS dark, regardless of the theme a user picked in
  // the app dashboards (that preference is stored globally by next-themes and
  // would otherwise turn the landing white). Forcing `dark` here re-declares the
  // dark tokens for this subtree; the "Pourquoi nous" section still opts back
  // into light via its own `theme-light` wrapper.
  return (
    <div className="dark bg-background text-foreground flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
