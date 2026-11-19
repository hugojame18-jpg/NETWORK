import { ImageResponse } from "next/og";

/**
 * The browser-tab icon: the mark itself — the white R on blue-violet —
 * drawn from the same paths as `LogoMark`, so the tab and the page show one
 * logo and not two approximations of it.
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
          borderRadius: 18,
          background: "linear-gradient(140deg, #7377f5, #5b5fe9 55%, #3f37c9)",
        }}
      >
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
          <path
            d="M11 23.5V8.5h6a4.6 4.6 0 0 1 0 9.2h-6"
            stroke="#ffffff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m16.4 17.7 4.9 5.8"
            stroke="#ffffff"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
