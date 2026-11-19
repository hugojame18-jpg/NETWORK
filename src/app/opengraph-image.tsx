import { ImageResponse } from "next/og";
import {
  MARK_BOWL,
  MARK_LEG,
  MARK_STEM,
  MARK_VIEWBOX,
} from "@/components/brand/logo-mark";

/**
 * The card shown when the site's link is pasted into a chat or a post.
 *
 * Generated rather than shipped as a file: it carries the same headline as
 * the hero, in the brand's colours, and a picture that has to be redrawn by
 * hand every time the copy changes is a picture that ends up out of date.
 *
 * Colours are written as hex here on purpose — the image renderer does not
 * read the stylesheet, so the theme's variables do not exist for it.
 */
export const alt = "RevNetwork — Le réseau d'affiliation CC Submit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#0b0c14";
const INDIGO = "#5b5fe9";
const ACCENT = "#9a9dff";

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
          {/* The mark: the white three-piece R on the brand's blue-violet. */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `linear-gradient(140deg, #8286fb, ${INDIGO} 55%, #3f37c9)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="48" height="48" viewBox={MARK_VIEWBOX} fill="#ffffff">
              <rect {...MARK_STEM} />
              <path d={MARK_BOWL} />
              <path d={MARK_LEG} />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
            Rev
            <span style={{ opacity: 0.6 }}>Network</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            Envoie ton trafic.
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -3,
              color: ACCENT,
            }}
          >
            Encaisse chaque conversion.
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
          <div style={{ display: "flex" }}>Réseau d&apos;affiliation CC Submit</div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: ACCENT,
            }}
          />
          <div style={{ display: "flex" }}>Conversions en direct</div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: ACCENT,
            }}
          />
          <div style={{ display: "flex" }}>Parrainage 10 %</div>
        </div>
      </div>
    ),
    size,
  );
}
