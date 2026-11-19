import { cn } from "@/lib/utils";

/**
 * The RevNetwork mark.
 *
 * An R on the brand's indigo, with one thing no other R has: the hole in its
 * bowl is a lit dot. That dot is the brand's idea in a single shape — the
 * signal that something just converted — and it is the same dot that marks a
 * live conversion in the product and pulses beside the headline on the
 * landing. Drawn as paths rather than set in type, so it keeps its weight at
 * any size and in any font stack; at favicon size the dot is still the first
 * thing the eye finds.
 *
 * The original logo file was lost with the first project folder. This mark is
 * designed to stand as the logo in its own right — swap the artwork here if
 * the original comes back, and every screen follows.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
        "bg-[linear-gradient(140deg,oklch(0.64_0.2_278),oklch(0.44_0.2_268))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0_/_28%),0_1px_2px_oklch(0.2_0.1_270_/_35%)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-[72%] w-[72%]">
        <path
          d="M11 23.5V8.5h6a4.6 4.6 0 0 1 0 9.2h-6"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m16.4 17.7 4.9 5.8"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="16.3" cy="13.1" r="1.6" fill="var(--signal)" />
      </svg>
    </span>
  );
}

/**
 * Mark plus wordmark. "Rev" carries the weight and "Network" steps back, so
 * the name reads the way it is said.
 */
export function Logo({
  label = "RevNetwork",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [head, tail] =
    label === "RevNetwork" ? ["Rev", "Network"] : [label, ""];
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display truncate text-[17px] leading-none font-bold tracking-tight">
        {head}
        {tail && <span className="font-medium opacity-65">{tail}</span>}
      </span>
    </span>
  );
}
