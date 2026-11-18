import { ImageResponse } from "next/og";

/**
 * The card shown when the site's link is pasted into a chat or a post.
 *
 * Generated rather than shipped as a file: it carries the same two promises as
 * the hero, and a picture that has to be redrawn by hand every time the copy
 * changes is a picture that ends up out of date.
 */
export const alt = "RevNetwork — Ton trafic rapporte, on te le paie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background:
            "radial-gradient(900px 520px at 50% 0%, #2a2f6b 0%, #0b0c14 70%)",
          color: "#f4f5fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6f74f2, #4aa3f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>RevNetwork</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Ton trafic rapporte.
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              color: "#8f94ff",
            }}
          >
            On te le paie.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 44,
            fontSize: 28,
            color: "#a9adc4",
          }}
        >
          <div style={{ display: "flex" }}>Payé à la conversion</div>
          <div style={{ display: "flex" }}>Conversions en direct</div>
          <div style={{ display: "flex" }}>Parrainage 10 %</div>
        </div>
      </div>
    ),
    size,
  );
}
