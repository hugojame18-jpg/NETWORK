import {
  BarChart3,
  Coins,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
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
 * Grouped around how the network is actually run: look at the money, do the
 * evening data entry, handle affiliates, keep the catalogue current, and only
 * then the plumbing. Advertisers and Campaigns are gone from the menu — the
 * network sells its own offers through a house advertiser, so they were empty
 * screens. Their routes still exist for any old bookmark.
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
    title: "Au quotidien",
    items: [
      { href: "/admin/stats", label: "Saisie des stats", icon: <BarChart3 /> },
    ],
  },
  {
    title: "Tracking",
    items: [
      { href: "/admin/postback", label: "Global postback", icon: <Webhook /> },
    ],
  },
  {
    title: "Affiliés",
    items: [
      { href: "/admin/affiliates", label: "Mes affiliés", icon: <Users /> },
      { href: "/admin/payments", label: "Paiements", icon: <Wallet /> },
      { href: "/admin/commissions", label: "Commissions", icon: <Coins /> },
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
