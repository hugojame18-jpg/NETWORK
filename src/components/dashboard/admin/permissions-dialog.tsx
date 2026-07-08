"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PermissionsDialogProps {
  userId: string;
  userName: string;
  allPermissions: { id: string; key: string; description: string }[];
  grantedKeys: string[];
}

export function PermissionsDialog({ userId, userName, allPermissions, grantedKeys }: PermissionsDialogProps) {
  const router = useRouter();
  const [granted, setGranted] = useState(new Set(grantedKeys));
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(key: string) {
    const willGrant = !granted.has(key);
    setPendingKey(key);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKey: key, grant: willGrant }),
      });
      setPendingKey(null);
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      setGranted((prev) => {
        const next = new Set(prev);
        if (willGrant) next.add(key);
        else next.delete(key);
        return next;
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Gérer les permissions">
            <KeyRound className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permissions de {userName}</DialogTitle>
          <DialogDescription>
            Les administrateurs ont accès à tout par défaut ; ces permissions permettent de restreindre un compte à un
            sous-ensemble d&apos;actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {allPermissions.map((permission) => (
            <label key={permission.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Checkbox
                checked={granted.has(permission.key)}
                onCheckedChange={() => toggle(permission.key)}
                disabled={pendingKey === permission.key}
              />
              <div>
                <p className="text-sm font-medium">{permission.key}</p>
                <p className="text-xs text-muted-foreground">{permission.description}</p>
              </div>
              {pendingKey === permission.key && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
