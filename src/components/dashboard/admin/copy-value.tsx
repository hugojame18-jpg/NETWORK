"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A value you are meant to paste somewhere else — a sub3, a postback URL.
 * Shows it in full and copies it in one click, because retyping a token by
 * hand into a campaign is exactly how conversions end up attributed to nobody.
 */
export function CopyValue({
  value,
  className,
  monospace = true,
}: {
  value: string;
  className?: string;
  monospace?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be refused; the value stays selectable by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copier"
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-muted",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          monospace && "font-mono",
        )}
      >
        {value}
      </span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}
