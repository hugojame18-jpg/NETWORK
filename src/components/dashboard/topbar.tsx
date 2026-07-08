"use client";

import { usePathname } from "next/navigation";
import type { NavItem } from "./sidebar-nav";
import { MobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsBell, type NotificationPreview } from "./notifications-bell";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  navItems: NavItem[];
  brandLabel: string;
  notifications: NotificationPreview[];
  notificationsHref: string;
  profileHref: string;
  settingsHref: string;
  user: { name: string; email: string; image?: string | null };
}

export function Topbar({
  navItems,
  brandLabel,
  notifications,
  notificationsHref,
  profileHref,
  settingsHref,
  user,
}: TopbarProps) {
  const pathname = usePathname();
  const activeItem = [...navItems].sort((a, b) => b.href.length - a.href.length).find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar items={navItems} brandLabel={brandLabel} />
        <h1 className="text-lg font-semibold">{activeItem?.label ?? brandLabel}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationsBell notifications={notifications} notificationsHref={notificationsHref} />
        <UserMenu {...user} profileHref={profileHref} settingsHref={settingsHref} />
      </div>
    </header>
  );
}
