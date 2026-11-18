import {
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";
import type { NavSection } from "@/components/dashboard/sidebar-nav";

/**
 * Grouped around how the network is actually run: look at the money, pay the
 * affiliates, check the pipes that bring the numbers in, then content and
 * plumbing.
 *
 * Off the menu because they read tables nothing fills any more — their routes
 * still answer for an old bookmark: Advertisers, Campaigns, Commissions, and
 * the link, site and offer screens that will come back with the catalogue.
 */
export const adminNavSections: NavSection[] = [
  {
    items: [
      {
        href: "/admin",
        label: "Pilotage",
        icon: <LayoutDashboard />,
        exact: true,
      },
      {
        href: "/admin/revenue",
        label: "Chiffre d'affaires",
        icon: <TrendingUp />,
      },
    ],
  },
  {
    title: "Affiliés",
    items: [
      { href: "/admin/affiliates", label: "Mes affiliés", icon: <Users /> },
      { href: "/admin/payments", label: "Paiements", icon: <Wallet /> },
    ],
  },
  {
    title: "Tracking",
    items: [
      { href: "/admin/postback", label: "Global postback", icon: <Webhook /> },
      { href: "/admin/flow", label: "Synchro Flow", icon: <RefreshCw /> },
      { href: "/admin/stats", label: "Stats par jour", icon: <BarChart3 /> },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/admin/training", label: "Formation", icon: <GraduationCap /> },
      { href: "/admin/announcements", label: "Messages", icon: <Megaphone /> },
    ],
  },
  {
    title: "Système",
    items: [
      {
        href: "/admin/users",
        label: "Utilisateurs & rôles",
        icon: <ShieldCheck />,
      },
      { href: "/admin/logs", label: "Logs", icon: <ScrollText /> },
      { href: "/admin/settings", label: "Paramètres", icon: <Settings /> },
    ],
  },
];
