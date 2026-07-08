"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const METHODS = [
  { value: "PAYPAL", label: "PayPal", field: "email", fieldLabel: "Email PayPal" },
  { value: "BANK_WIRE", label: "Virement bancaire", field: "iban", fieldLabel: "IBAN" },
  { value: "CRYPTO", label: "Crypto-monnaie", field: "wallet", fieldLabel: "Adresse de wallet (USDT)" },
  { value: "PAYONEER", label: "Payoneer", field: "email", fieldLabel: "Email Payoneer" },
];

interface PaymentMethodFormProps {
  method: string;
  details: Record<string, string>;
}

export function PaymentMethodForm({ method, details }: PaymentMethodFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(method || "PAYPAL");
  const current = METHODS.find((m) => m.value === selected)!;
  const [value, setValue] = useState(details?.[current.field] ?? "");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/publisher/payment-method", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selected, paymentDetails: { [current.field]: value } }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      toast.success("Méthode de paiement mise à jour.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Méthode</Label>
        <Select
          value={selected}
          onValueChange={(v) => {
            if (!v) return;
            setSelected(v);
            setValue("");
          }}
        >
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
      <div className="space-y-2">
        <Label htmlFor="detail">{current.fieldLabel}</Label>
        <Input id="detail" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
