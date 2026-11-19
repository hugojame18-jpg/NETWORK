"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { NavSection } from "./sidebar-nav";
import { MobileSidebar } from "./mobile-sidebar";
import {
  NotificationsBell,
  type NotificationPreview,
} from "./notifications-bell";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  navSections: NavSection[];
  brandLabel: string;
  notifications: NotificationPreview[];
  notificationsHref: string;
  profileHref: string;
  settingsHref: string;
  user: { name: string; email: string; image?: string | null };
}

/** Finds the deepest matching nav entry, and the section it belongs to. */
function locate(sections: NavSection[], pathname: string) {
  const candidates = sections.flatMap((section) =>
    section.items.map((item) => ({ item, section: section.title })),
  );
  return candidates
    .sort((a, b) => b.item.href.length - a.item.href.length)
    .find(({ item }) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    );
}

export function Topbar({
  navSections,
  brandLabel,
  notifications,
  notificationsHref,
  profileHref,
  settingsHref,
  user,
}: TopbarProps) {
  const pathname = usePathname();
  const current = locate(navSections, pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar sections={navSections} brandLabel={brandLabel} />

        {/* A breadcrumb rather than a repeat of the page title: the heading
            belongs to the page itself, this says where that page sits. */}
        <nav
          aria-label="Fil d'ariane"
          className="flex min-w-0 items-center gap-1.5 text-sm"
        >
          {current?.section && (
            <>
              <span className="hidden truncate text-muted-foreground sm:inline">
                {current.section}
              </span>
              <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 sm:inline" />
            </>
          )}
          <span className="truncate font-medium">
            {current?.item.label ?? brandLabel}
          </span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <NotificationsBell
          notifications={notifications}
          notificationsHref={notificationsHref}
        />
        <div className="ml-1 h-5 w-px bg-border" aria-hidden />
        <UserMenu
          {...user}
          profileHref={profileHref}
          settingsHref={settingsHref}
        />
      </div>
    </header>
  );
}
