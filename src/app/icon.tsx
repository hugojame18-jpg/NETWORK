import { ImageResponse } from "next/og";
import {
  MARK_LEG,
  MARK_LEG_OPACITY,
  MARK_TOP,
  MARK_TRANSFORM,
  MARK_VIEWBOX,
} from "@/components/brand/logo-mark";

/**
 * The browser-tab icon: the mark itself — the white italic R on the
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
        <svg width="46" height="46" viewBox={MARK_VIEWBOX} fill="#ffffff">
          <g transform={MARK_TRANSFORM}>
            <path d={MARK_TOP} fillRule="evenodd" />
            <path d={MARK_LEG} opacity={MARK_LEG_OPACITY} />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
