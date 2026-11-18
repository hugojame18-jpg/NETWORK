"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  /** A pre-rendered icon element, e.g. `<LayoutDashboard />` — not the component reference. */
  icon: ReactNode;
  exact?: boolean;
  /** Small count on the right, for queues that need clearing. */
  badge?: number;
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
 *
 * The active item is marked by a rail against the sidebar's edge rather than a
 * filled pill alone: it survives collapsing, it never fights the brand colour
 * used elsewhere on the page, and it tells you where you are from the corner
 * of your eye.
 */
export function SidebarNav({
  sections,
  collapsed = false,
}: {
  sections: NavSection[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 pt-2">
      {sections.map((section, index) => (
        <div
          key={section.title ?? `section-${index}`}
          className="flex flex-col gap-0.5"
        >
          {section.title &&
            (collapsed ? (
              <span
                className="mx-auto mb-2 h-px w-5 bg-sidebar-border"
                aria-hidden
              />
            ) : (
              <p className="eyebrow px-3 pb-2">{section.title}</p>
            ))}

          {section.items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-sidebar-accent/70 font-medium text-foreground"
                    : "font-normal text-muted-foreground hover:bg-sidebar-accent/35 hover:text-foreground",
                )}
              >
                {active && (
                  <span
                    className="absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "shrink-0 transition-colors [&_svg]:h-[17px] [&_svg]:w-[17px]",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="num ml-auto rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
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
