import { ImageResponse } from "next/og";

/**
 * The browser-tab icon: the same R on the same gradient as the mark inside
 * the app, instead of the framework's default.
 *
 * It stands in for the real logo, like `LogoMark` does — when the artwork is
 * back, both change together.
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
          borderRadius: 16,
          background: "linear-gradient(135deg, #6f74f2, #4aa3f0)",
          color: "#ffffff",
          fontSize: 44,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
