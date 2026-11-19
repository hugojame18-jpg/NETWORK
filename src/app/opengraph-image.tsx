import { ImageResponse } from "next/og";

/**
 * The card shown when the site's link is pasted into a chat or a post.
 *
 * Generated rather than shipped as a file: it carries the same two lines as
 * the hero, in the brand's two colours, and a picture that has to be redrawn
 * by hand every time the copy changes is a picture that ends up out of date.
 *
 * Colours are written as hex here on purpose — the image renderer does not
 * read the stylesheet, so the theme's variables do not exist for it.
 */
export const alt = "RevNetwork — Ton trafic rapporte, on te le paie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#0b0c14";
const INDIGO = "#5b5fe9";
const SIGNAL = "#9a9dff";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `radial-gradient(900px 520px at 50% -10%, #3a3fb8 0%, ${NIGHT} 68%)`,
          color: "#f4f5fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* The mark: the white R on the brand's blue-violet. */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `linear-gradient(140deg, #7377f5, ${INDIGO} 55%, #3f37c9)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
              <path
                d="M11 23.5V8.5h6a4.6 4.6 0 0 1 0 9.2h-6"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m16.4 17.7 4.9 5.8"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
            Rev
            <span style={{ fontWeight: 500, opacity: 0.65 }}>Network</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            Ton trafic rapporte.
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: SIGNAL,
            }}
          >
            On te le paie.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontSize: 28,
            color: "#b3b7cc",
          }}
        >
          <div style={{ display: "flex" }}>Payé à la conversion</div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: SIGNAL,
            }}
          />
          <div style={{ display: "flex" }}>Conversions en direct</div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: SIGNAL,
            }}
          />
          <div style={{ display: "flex" }}>Parrainage 10 %</div>
        </div>
      </div>
    ),
    size,
  );
}
