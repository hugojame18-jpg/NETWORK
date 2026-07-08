import { Bell, LayoutDashboard, Layers, Megaphone, Settings, User, BarChart3 } from "lucide-react";
import type { NavItem } from "@/components/dashboard/sidebar-nav";

export const advertiserNavItems: NavItem[] = [
  { href: "/advertiser", label: "Overview", icon: <LayoutDashboard />, exact: true },
  { href: "/advertiser/campaigns", label: "Campagnes", icon: <Megaphone /> },
  { href: "/advertiser/offers", label: "Offres", icon: <Layers /> },
  { href: "/advertiser/stats", label: "Statistiques", icon: <BarChart3 /> },
  { href: "/advertiser/notifications", label: "Notifications", icon: <Bell /> },
  { href: "/advertiser/profile", label: "Profil", icon: <User /> },
  { href: "/advertiser/settings", label: "Paramètres", icon: <Settings /> },
];
