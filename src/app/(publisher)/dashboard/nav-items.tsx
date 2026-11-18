import {
  BarChart3,
  Gift,
  GraduationCap,
  History,
  LayoutDashboard,
  Link2,
  Layers,
  MonitorSmartphone,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import type { NavSection } from "@/components/dashboard/sidebar-nav";

/**
 * Grouped by what the affiliate is trying to do, in the order they do it:
 * pick something to promote, get the link, watch the numbers, level up, get
 * paid. Notifications are deliberately absent — the topbar bell already owns
 * them, and a duplicate entry only lengthens the list.
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
    title: "Gagner",
    items: [
      { href: "/dashboard/offers", label: "Offres", icon: <Layers /> },
      {
        href: "/dashboard/sites",
        label: "Sites à promouvoir",
        icon: <MonitorSmartphone />,
      },
      { href: "/dashboard/links", label: "Mes liens", icon: <Link2 /> },
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
