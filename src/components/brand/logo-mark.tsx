import { cn } from "@/lib/utils";

/**
 * The mark's geometry, on a 64 × 64 grid: an R cut like a blade — chamfered
 * corners, leaning forward, its leg detached from the bowl by one clean gap.
 * Exported so the tab icon and the share card, which cannot render this
 * component, draw the very same R instead of an approximation of it.
 */
export const MARK_VIEWBOX = "0 0 64 64";
export const MARK_TRANSFORM = "translate(5.5 0) skewX(-10)";
/** Stem and bowl in one piece; fill with the even-odd rule for the counter. */
export const MARK_TOP =
  "M14 54V10h27l9 9v11l-7 7H26v17z M26 20v8h11.5l2.5-2.5v-3L37.5 20z";
export const MARK_LEG = "M30 40.5h13L55 54H42z";
/** The leg sits a step back from the rest, so the R reads as two facets. */
export const MARK_LEG_OPACITY = 0.78;

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
      <g transform={MARK_TRANSFORM}>
        <path d={MARK_TOP} fillRule="evenodd" />
        <path d={MARK_LEG} opacity={MARK_LEG_OPACITY} />
      </g>
    </svg>
  );
}

/**
 * The RevNetwork mark — the one he picked on 2026-11-19 out of four.
 *
 * An italic R with its corners cut and its leg set apart: the lean and the
 * sharp edges are the "Rev" in the name. White on the brand's blue-violet —
 * the whole palette in one tile.
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
