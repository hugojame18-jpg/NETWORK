"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      className={cn("w-full", className)}
      onClick={() => signOut({ redirectTo: "/" })}
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </Button>
  );
}
