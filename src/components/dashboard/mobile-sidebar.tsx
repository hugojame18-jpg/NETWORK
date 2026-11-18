"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { SidebarNav, type NavSection } from "./sidebar-nav";
import { Logo } from "@/components/brand/logo-mark";

export function MobileSidebar({
  sections,
  brandLabel,
}: {
  sections: NavSection[];
  brandLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent
        side="left"
        className="w-[272px] border-sidebar-border bg-sidebar p-0"
      >
        <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
          <SheetTitle>
            <Logo label={brandLabel} />
          </SheetTitle>
        </SheetHeader>
        <div className="px-3 pb-4" onClick={() => setOpen(false)}>
          <SidebarNav sections={sections} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
