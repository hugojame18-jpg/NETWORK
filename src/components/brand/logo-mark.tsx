import { cn } from "@/lib/utils";

/**
 * The RevNetwork mark: three rising bars with a node on the tallest one —
 * revenue going up, carried across a network. Drawn rather than set in type,
 * because a letter in a coloured square is what every unfinished dashboard
 * uses and it reads as a placeholder.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
        "bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary)_60%,var(--chart-2))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0_/_25%)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M4 17.5v-3M9.5 17.5v-6.5M15 17.5V8"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M15 8 20 4"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="20" cy="4" r="2.6" className="fill-primary-foreground" />
      </svg>
    </span>
  );
}

/** Mark plus wordmark, for the sidebar head and the mobile sheet. */
export function Logo({
  label = "RevNetwork",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="truncate text-[15px] font-semibold tracking-tight">
        {label}
      </span>
    </span>
  );
}
