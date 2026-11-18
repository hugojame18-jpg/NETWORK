import {
  BarChart3,
  Gift,
  GraduationCap,
  History,
  LayoutDashboard,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import type { NavSection } from "@/components/dashboard/sidebar-nav";

/**
 * Grouped by what the affiliate is trying to do, in the order they do it:
 * watch the numbers, level up, get paid. Notifications are deliberately
 * absent — the topbar bell already owns them, and a duplicate entry only
 * lengthens the list.
 *
 * Offers, Sites and My links are off the menu for now: an affiliate is given
 * their link directly, and conversions come back on the global postback, so
 * those screens had nothing to show. Their routes are untouched, ready to be
 * listed again here.
 */
export const publisherNavSections: NavSection[] = [
  {
    items: [
      {
        href: "/dashboard",
        label: "Accueil",
        icon: <LayoutDashboard />,
        exact: true,
      },
    ],
  },
  {
    title: "Performance",
    items: [
      { href: "/dashboard/stats", label: "Statistiques", icon: <BarChart3 /> },
      { href: "/dashboard/history", label: "Historique", icon: <History /> },
    ],
  },
  {
    title: "Progresser",
    items: [
      {
        href: "/dashboard/training",
        label: "Formation",
        icon: <GraduationCap />,
      },
      { href: "/dashboard/rewards", label: "Récompenses", icon: <Gift /> },
    ],
  },
  {
    title: "Mon compte",
    items: [
      { href: "/dashboard/payments", label: "Paiements", icon: <Wallet /> },
      { href: "/dashboard/profile", label: "Profil", icon: <User /> },
      { href: "/dashboard/settings", label: "Paramètres", icon: <Settings /> },
    ],
  },
];
