"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  /** A pre-rendered icon element, e.g. `<LayoutDashboard className="h-4 w-4" />` — not the component reference. */
  icon: ReactNode;
  exact?: boolean;
}

export interface NavSection {
  /** Omitted for the first group, which sits above any heading. */
  title?: string;
  items: NavItem[];
}

/**
 * Both dashboards outgrew a flat list — a dozen-plus links with no grouping
 * forces you to read every label to find anything. Sections give the eye an
 * anchor; when the sidebar is collapsed they turn into separators, since a
 * heading would have nowhere to render.
 */
export function SidebarNav({ sections, collapsed = false }: { sections: NavSection[]; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {sections.map((section, index) => (
        <div key={section.title ?? `section-${index}`} className="flex flex-col gap-1">
          {section.title &&
            (collapsed ? (
              <span className="mx-auto my-1 h-px w-5 bg-border" aria-hidden />
            ) : (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {section.title}
              </p>
            ))}

          {section.items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Flattens sections, for consumers that still need a plain list (mobile menu). */
export function flattenNav(sections: NavSection[]): NavItem[] {
  return sections.flatMap((section) => section.items);
}
