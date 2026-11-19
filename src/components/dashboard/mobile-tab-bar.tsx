"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  href: string;
  label: string;
  /** A pre-rendered icon element. */
  icon: ReactNode;
  exact?: boolean;
}

/**
 * The affiliate's navigation on a phone.
 *
 * Most affiliates open this from their phone, between two posts, to answer one
 * question: did it convert? A drawer hidden behind a hamburger puts every
 * answer two taps away; a tab bar under the thumb puts the five screens that
 * matter one tap away. The drawer stays for everything else.
 */
export function MobileTabBar({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active && (
                  <span
                    className="absolute top-0 h-[2px] w-8 rounded-b-full bg-primary"
                    aria-hidden
                  />
                )}
                <span className="[&_svg]:h-[19px] [&_svg]:w-[19px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
