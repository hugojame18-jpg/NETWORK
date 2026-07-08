"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { SidebarNav, type NavItem } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  items: NavItem[];
  brandLabel: string;
  brandHref: string;
}

export function Sidebar({ items, brandLabel, brandHref }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card/40 transition-[width] duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 px-5", collapsed && "justify-center px-0")}>
        <Link href={brandHref} className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
            CC
          </span>
          {!collapsed && <span className="truncate">{brandLabel}</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <SidebarNav items={items} collapsed={collapsed} />
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
