"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BanknoteArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

interface RecordPayoutDialogProps {
  publisherId: string;
  publisherName: string;
  /** What is owed right now — the amount the form opens on. */
  balance: number;
  /** The method the affiliate registered, used as the default. */
  defaultMethod?: string | null;
}

function today(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  )
    .toISOString()
    .slice(0, 10);
}

/**
 * Writes down a payment that has already been sent.
 *
 * It opens on the full balance and today's date, because paying everything
 * owed today is the ordinary case — but both stay editable, since a partial
 * payment or one sent last Friday is the whole reason this records a date
 * instead of assuming one.
 *
 * The figure under the form is the point of the screen: it says what the
 * balance becomes, before anything is written.
 */
export function RecordPayoutDialog({
  publisherId,
  publisherName,
  balance,
  defaultMethod,
}: RecordPayoutDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const suggested = balance > 0 ? balance.toFixed(2) : "";
  const [amount, setAmount] = useState(suggested);
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState(defaultMethod ?? "PAYPAL");
  const [note, setNote] = useState("");

  const parsedAmount = Number(amount);
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const remaining = balance - (valid ? parsedAmount : 0);
  const overpaying = valid && parsedAmount > balance + 0.005;

  function reset() {
    setAmount(suggested);
    setPaidAt(today());
    setMethod(defaultMethod ?? "PAYPAL");
    setNote("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) {
      toast.error("Indique un montant supérieur à 0.");
      return;
    }

    startTransition(async () => {
      const res = await fetch(
        `/api/admin/publishers/${publisherId}/payouts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parsedAmount,
            paidAt,
            method,
            note,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer ce paiement.");
        return;
      }
      toast.success(
        `Paiement de ${formatCurrency(parsedAmount)} enregistré. Solde restant : ${formatCurrency(
          json.balance ?? remaining,
        )}.`,
      );
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <BanknoteArrowUp className="h-4 w-4" />
            Enregistrer un paiement
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paiement à {publisherName}</DialogTitle>
          <DialogDescription>
            Note ici ce que tu lui as déjà envoyé. Cela déduit de son solde et
            ne touche pas à ses statistiques : ses chiffres du mois restent
            identiques après le paiement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Montant envoyé ($)</Label>
              <Input
                id="payout-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                autoFocus
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-date">Date du paiement</Label>
              <Input
                id="payout-date"
                type="date"
                required
                value={paidAt}
                onChange={(event) => setPaidAt(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Moyen de paiement</Label>
            <Select
              value={method}
              onValueChange={(value) => value && setMethod(String(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payout-note">Référence (optionnel)</Label>
            <Textarea
              id="payout-note"
              rows={2}
              maxLength={500}
              placeholder="Hash de transaction, numéro de virement, commentaire…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Solde actuel</span>
              <span className="num font-medium">
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-muted-foreground">Après ce paiement</span>
              <span className="num font-semibold">
                {formatCurrency(valid ? remaining : balance)}
              </span>
            </div>
            {overpaying && (
              <p className="mt-2.5 flex items-start gap-1.5 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Ce montant dépasse ce qu&apos;il a gagné. Son solde passera en
                négatif et sera rattrapé par ses prochaines conversions.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !valid}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Marquer comme payé
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
