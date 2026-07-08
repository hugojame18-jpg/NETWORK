"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { SidebarNav, type NavItem } from "./sidebar-nav";

export function MobileSidebar({ items, brandLabel }: { items: NavItem[]; brandLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-16 justify-center border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              CC
            </span>
            {brandLabel}
          </SheetTitle>
        </SheetHeader>
        <div className="px-3 py-2" onClick={() => setOpen(false)}>
          <SidebarNav items={items} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
