import { cn } from "@/lib/utils";

/**
 * The RevNetwork mark: the brand's R, drawn as paths rather than set in type so
 * it keeps its weight and proportions at any size and in any font stack.
 *
 * NOTE: this stands in for the real logo file, which was lost with the original
 * project folder. Swap the artwork here once it is back.
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
      <svg viewBox="0 0 24 24" fill="none" className="h-[19px] w-[19px]">
        <path
          d="M8 19.5V4.5h5a4.25 4.25 0 0 1 0 8.5H8"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m12.6 13 4.6 6.5"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
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
