import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** A pre-rendered icon element, e.g. `<Inbox />` — sized by this component. */
  icon: ReactNode;
  title: string;
  /** Why it's empty and what fills it. Never leave the reader guessing. */
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Replaces the one-line "Aucun X pour le moment." that used to float in the
 * middle of an otherwise blank page. An empty screen is the first thing a new
 * affiliate sees, so it has to look intentional and say what happens next.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground [&_svg]:h-6 [&_svg]:w-6">
        {icon}
        <span
          className="absolute -inset-4 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_70%)]"
          aria-hidden
        />
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
