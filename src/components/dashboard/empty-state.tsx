import type { ReactNode } from "react";
import { MascotFull, type MascotPose } from "@/components/brand/mascot";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** A pre-rendered icon element, e.g. `<Inbox />` — sized by this component. */
  icon: ReactNode;
  title: string;
  /** Why it's empty and what fills it. Never leave the reader guessing. */
  description?: string;
  action?: ReactNode;
  /** What the fox is doing here. Asleep by default: nothing has happened yet. */
  pose?: MascotPose;
  className?: string;
}

/**
 * Replaces the one-line "Aucun X pour le moment." that used to float in the
 * middle of an otherwise blank page. An empty screen is the first thing a new
 * affiliate sees, so it has to look intentional and say what happens next.
 *
 * The mascot waits in the empty space — asleep unless the screen asks for
 * another pose — and the screen's own icon rides on it as a badge: the fox
 * says "nothing is wrong", the badge says what will appear here.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  pose = "sleep",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-5">
        <span
          className="absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_70%)]"
          aria-hidden
        />
        <MascotFull pose={pose} className="h-32 w-auto" />
        <span className="absolute -right-2 -bottom-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
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
