"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface RequestPaymentFormProps {
  available: number;
  minPayout: number;
  defaultMethod?: string | null;
}

const METHODS = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "BANK_WIRE", label: "Virement bancaire" },
  { value: "CRYPTO", label: "Crypto-monnaie" },
  { value: "PAYONEER", label: "Payoneer" },
];

export function RequestPaymentForm({ available, minPayout, defaultMethod }: RequestPaymentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(available.toFixed(2));
  const [method, setMethod] = useState(defaultMethod ?? "PAYPAL");
  const [isPending, startTransition] = useTransition();

  const canRequest = available >= minPayout;

  function submit() {
    startTransition(async () => {
      const res = await fetch("/api/publisher/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de créer la demande.");
        return;
      }
      toast.success("Demande de paiement envoyée.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button disabled={!canRequest}>
            <Wallet className="h-4 w-4" />
            Demander un paiement
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demander un paiement</DialogTitle>
          <DialogDescription>
            Solde disponible : {available.toFixed(2)} $ · minimum {minPayout.toFixed(2)} $
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant ($)</Label>
            <Input
              id="amount"
              type="number"
              min={minPayout}
              max={available}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <Select value={method} onValueChange={(value) => value && setMethod(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
