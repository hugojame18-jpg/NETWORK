"use client";

import { useState } from "react";
import Link from "next/link";
import { LifeBuoy, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarNav, type NavSection } from "./sidebar-nav";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sections: NavSection[];
  brandLabel: string;
  brandHref: string;
  /** Shown under the wordmark — tells an admin at a glance which panel they're in. */
  brandSuffix?: string;
  /** Where "need help?" leads. Omitted on the admin side, which is the help. */
  supportHref?: string;
}

export function Sidebar({
  sections,
  brandLabel,
  brandHref,
  brandSuffix,
  supportHref,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[72px]" : "w-[252px]",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          href={brandHref}
          className="flex min-w-0 items-center gap-2.5 rounded-lg"
        >
          <LogoMark />
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-semibold tracking-tight">
                {brandLabel}
              </span>
              {brandSuffix && (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {brandSuffix}
                </span>
              )}
            </span>
          )}
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <SidebarNav sections={sections} collapsed={collapsed} />
      </div>

      <div className="shrink-0 space-y-1 border-t border-sidebar-border p-2">
        {supportHref && (
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? "Contacter l'équipe" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <LifeBuoy className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Contacter l&apos;équipe</span>}
          </a>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!collapsed && <span>Replier</span>}
        </button>
      </div>
    </aside>
  );
}
