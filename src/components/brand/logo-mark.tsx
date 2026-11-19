import { cn } from "@/lib/utils";

/**
 * The mark's geometry, on a 64 × 64 grid: one line that draws an R and then,
 * without lifting, the N — the R's leg is the N's diagonal. Exported so the
 * tab icon and the share card, which cannot render this component, draw the
 * very same monogram instead of an approximation of it.
 */
export const MARK_VIEWBOX = "0 0 64 64";
export const MARK_TRANSFORM = "translate(7 -2.5) skewX(-9)";
export const MARK_PATH =
  "M13 54V14.75h14.5a9.9 9.9 0 0 1 0 19.8H13 M23.5 34.55l27.5 20.45V10";
export const MARK_STROKE = 9.5;
export const MARK_MITER = 8;

/**
 * The monogram on its own, in whatever colour the text around it has. Used
 * bare on dark and light surfaces; `LogoMark` puts it on the brand's tile.
 */
export function MarkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} fill="none" className={className} aria-hidden>
      <g transform={MARK_TRANSFORM}>
        <path
          d={MARK_PATH}
          stroke="currentColor"
          strokeWidth={MARK_STROKE}
          strokeLinejoin="miter"
          strokeMiterlimit={MARK_MITER}
        />
      </g>
    </svg>
  );
}

/**
 * The RevNetwork mark.
 *
 * An RN monogram drawn in a single stroke: the R, and the N that grows out of
 * its leg. The two letters of the name share one line the way a network
 * shares one link; the forward lean and the point the stroke ends on give it
 * the speed the word "Rev" promises. White on the brand's blue-violet — the
 * whole palette in one tile.
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
      <MarkGlyph className="h-[70%] w-[70%]" />
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
