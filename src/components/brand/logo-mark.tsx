import { cn } from "@/lib/utils";

/**
 * The RevNetwork mark.
 *
 * A white R on the brand's blue-violet — the brand's whole palette in one
 * tile: blue-violet, white, and the black it sits on. Drawn as paths rather
 * than set in type, so it keeps its weight at any size and in any font stack.
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
