/**
 * What an affiliate is shown as the name of an offer.
 *
 * The upstream network names its offers for its own use — country, type,
 * product, price, advertiser: "BE | CC | Blank v2 (DTC) - €9.99 - Lotus".
 * Passed through as is, that hands every affiliate the advertiser's name and
 * the product's price, which is the network's sourcing and not theirs to see.
 *
 * What is useful to them is where the conversion came from and what kind it
 * was, so that is all that is kept: "BE · CC Submit". Anything that does not
 * follow the expected shape is shown as a plain "Conversion" rather than
 * guessed at — an unparsed name is assumed to be private.
 */
export function publicOfferLabel(name: string | null | undefined): string {
  if (!name) return "Conversion";

  const parts = name
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return "Conversion";

  const [geo, kind] = parts;
  // A real geo segment is a country code or a short word ("MultiGeo"). A long
  // first segment means the name is not in the expected shape.
  if (geo.length > 12 || kind.length > 12) return "Conversion";

  const kindLabel = kind.toUpperCase() === "CC" ? "CC Submit" : kind;
  return `${geo} · ${kindLabel}`;
}
