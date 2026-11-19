import { ImageResponse } from "next/og";
import {
  MARK_BOWL,
  MARK_LEG,
  MARK_STEM,
  MARK_VIEWBOX,
} from "@/components/brand/logo-mark";

/**
 * The browser-tab icon: the mark itself — the white three-piece R on the
 * brand's blue-violet — drawn from the same shapes as `LogoMark`, so the tab
 * and the page show one logo and not two approximations of it.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 17,
          background: "linear-gradient(140deg, #8286fb, #5b5fe9 55%, #3f37c9)",
        }}
      >
        <svg width="44" height="44" viewBox={MARK_VIEWBOX} fill="#ffffff">
          <rect {...MARK_STEM} />
          <path d={MARK_BOWL} />
          <path d={MARK_LEG} />
        </svg>
      </div>
    ),
    size,
  );
}
