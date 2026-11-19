import { cn } from "@/lib/utils";

/**
 * The three shapes the mark is built from, on a 48 × 48 grid: a stem, a half
 * disc and a diagonal leg, set apart by the same gap. Exported so the tab icon
 * and the share card — which cannot render this component — draw the very
 * same R instead of an approximation of it.
 */
export const MARK_VIEWBOX = "0 0 48 48";
export const MARK_STEM = { x: 10.5, y: 9, width: 9, height: 30 };
export const MARK_BOWL = "M22.5 9H27a9.25 9.25 0 0 1 0 18.5h-4.5z";
export const MARK_LEG = "M22.5 30.3h8.1L37.5 39h-8.1z";

/**
 * The R on its own, in whatever colour the text around it has. Used bare on
 * dark and light surfaces; `LogoMark` puts it on the brand's tile.
 */
export function MarkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect {...MARK_STEM} />
      <path d={MARK_BOWL} />
      <path d={MARK_LEG} />
    </svg>
  );
}

/**
 * The RevNetwork mark.
 *
 * An R assembled from three separate pieces rather than drawn in one stroke:
 * a network is parts that work together, and the gaps between them are what
 * make this R recognisable at sixteen pixels as well as at six hundred. White
 * on the brand's blue-violet — the whole palette in one tile.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white",
        "bg-[linear-gradient(140deg,oklch(0.66_0.19_278),oklch(0.55_0.22_277)_55%,oklch(0.45_0.21_272))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0_/_28%),0_1px_2px_oklch(0.2_0.1_270_/_35%)]",
        className,
      )}
      aria-hidden
    >
      <MarkGlyph className="h-[66%] w-[66%]" />
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
      <span className="font-display truncate text-[18px] leading-none font-extrabold tracking-[-0.04em]">
        {head}
        {tail && <span className="font-bold opacity-60">{tail}</span>}
      </span>
    </span>
  );
}
