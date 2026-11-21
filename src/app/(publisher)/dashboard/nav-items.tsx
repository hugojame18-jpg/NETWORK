import {
  BarChart3,
  Gift,
  GraduationCap,
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  Target,
  User,
  Wallet,
} from "lucide-react";
import type { NavSection } from "@/components/dashboard/sidebar-nav";
import type { TabItem } from "@/components/dashboard/mobile-tab-bar";

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
      { href: "/dashboard/history", label: "Conversions", icon: <Target /> },
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
    title: "Mes sites",
    items: [
      {
        href: "/dashboard/les-sites",
        label: "Les sites",
        icon: <MonitorSmartphone />,
      },
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

/**
 * The five screens an affiliate opens from a phone, in the order of the
 * question they answer: how am I doing, in detail, what converted, what am I
 * owed, which sites do I run. Everything else stays in the drawer.
 */
export const publisherTabs: TabItem[] = [
  { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/stats", label: "Stats", icon: <BarChart3 /> },
  { href: "/dashboard/history", label: "Conversions", icon: <Target /> },
  { href: "/dashboard/payments", label: "Paiements", icon: <Wallet /> },
  { href: "/dashboard/les-sites", label: "Sites", icon: <MonitorSmartphone /> },
];
