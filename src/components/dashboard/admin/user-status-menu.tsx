"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Loader2, MoreHorizontal, PauseCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserStatusMenuProps {
  userId: string;
  currentStatus: string;
  userLabel: string;
}

export function UserStatusMenu({ userId, currentStatus, userLabel }: UserStatusMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function setStatus(status: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      toast.success("Statut mis à jour.");
      router.refresh();
    });
  }

  function deleteUser() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      toast.success("Compte supprimé.");
      setConfirmDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Actions" disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {currentStatus !== "ACTIVE" && (
            <DropdownMenuItem onClick={() => setStatus("ACTIVE")}>
              <CheckCircle2 className="h-4 w-4" />
              Activer
            </DropdownMenuItem>
          )}
          {currentStatus !== "SUSPENDED" && (
            <DropdownMenuItem onClick={() => setStatus("SUSPENDED")}>
              <PauseCircle className="h-4 w-4" />
              Suspendre
            </DropdownMenuItem>
          )}
          {currentStatus !== "BANNED" && (
            <DropdownMenuItem onClick={() => setStatus("BANNED")} variant="destructive">
              <Ban className="h-4 w-4" />
              Bannir
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmDelete(true)} variant="destructive">
            <Trash2 className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer {userLabel} ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible : le compte, ses liens, clics et commissions seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteUser} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
