import { Bell, History, LayoutDashboard, Link2, Settings, User, Wallet, Layers, BarChart3, Gift } from "lucide-react";
import type { NavItem } from "@/components/dashboard/sidebar-nav";

export const publisherNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/dashboard/stats", label: "Statistiques", icon: <BarChart3 /> },
  { href: "/dashboard/offers", label: "Offres disponibles", icon: <Layers /> },
  { href: "/dashboard/links", label: "Mes liens", icon: <Link2 /> },
  { href: "/dashboard/rewards", label: "Récompenses", icon: <Gift /> },
  { href: "/dashboard/history", label: "Historique", icon: <History /> },
  { href: "/dashboard/payments", label: "Paiements", icon: <Wallet /> },
  { href: "/dashboard/notifications", label: "Notifications", icon: <Bell /> },
  { href: "/dashboard/profile", label: "Profil", icon: <User /> },
  { href: "/dashboard/settings", label: "Paramètres", icon: <Settings /> },
];
