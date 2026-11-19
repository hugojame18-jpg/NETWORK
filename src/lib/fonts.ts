import { Bricolage_Grotesque } from "next/font/google";

/**
 * The display face: headlines on the landing and the sign-in panel.
 *
 * Bricolage Grotesque has the one thing the body face is designed not to have
 * — a voice. Its heavy weights are tight and a little irregular, which is what
 * makes a two-line headline read as a brand rather than as a template. It is
 * used for titles only; everything meant to be read at length stays in Geist.
 *
 * Declared here and attached by the layouts that need it, not at the root, so
 * the dashboards do not download a font they never draw.
 */
export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
