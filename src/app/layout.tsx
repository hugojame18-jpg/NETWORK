import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { appUrl } from "@/lib/app-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Réseau d'affiliation CC Submit. Tu envoies ton trafic, chaque conversion validée s'affiche en direct et t'est payée. Inscription gratuite.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "RevNetwork — Ton trafic rapporte, on te le paie",
    template: "%s · RevNetwork",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "RevNetwork",
    locale: "fr_FR",
    title: "RevNetwork — Ton trafic rapporte, on te le paie",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          {/* The dashboards are light only — there is no theme switch any
              more, and a preference stored by an earlier visit must not bring
              the dark build back. The marketing landing stays dark through its
              own `dark` wrapper, which is plain CSS and unaffected by this. */}
          <ThemeProvider
            attribute="class"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider delay={150}>
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
