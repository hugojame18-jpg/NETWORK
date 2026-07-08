import {
  LayoutDashboard,
  Users,
  Megaphone,
  Layers,
  Wallet,
  Coins,
  ShieldCheck,
  ScrollText,
  Settings,
  BarChart3,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/sidebar-nav";

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/admin/affiliates", label: "Affiliés", icon: <Users /> },
  { href: "/admin/stats", label: "Statistiques quotidiennes", icon: <BarChart3 /> },
  { href: "/admin/advertisers", label: "Annonceurs", icon: <Megaphone /> },
  { href: "/admin/campaigns", label: "Campagnes", icon: <Megaphone /> },
  { href: "/admin/offers", label: "Offres", icon: <Layers /> },
  { href: "/admin/payments", label: "Paiements", icon: <Wallet /> },
  { href: "/admin/commissions", label: "Commissions", icon: <Coins /> },
  { href: "/admin/users", label: "Utilisateurs & rôles", icon: <ShieldCheck /> },
  { href: "/admin/logs", label: "Logs", icon: <ScrollText /> },
  { href: "/admin/settings", label: "Paramètres", icon: <Settings /> },
];
