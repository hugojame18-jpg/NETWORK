// Canonical list of affiliate verticals used across the network. The Offer
// model stores `category` as a free-text string (legacy offers may hold any
// value), but new offers are picked from this list so a vertical like Casino
// is always spelled and grouped consistently.

export interface Vertical {
  /** Stored value in Offer.category — keep stable, it's persisted. */
  value: string;
  /** Human label shown in the UI. */
  label: string;
  /** Emoji icon for compact display on cards and filters. */
  icon: string;
}

export const VERTICALS: Vertical[] = [
  { value: "Casino", label: "Casino & iGaming", icon: "🎰" },
  { value: "Sports Betting", label: "Paris sportifs", icon: "🎯" },
  { value: "Sweepstakes", label: "Sweepstakes", icon: "🎁" },
  { value: "VOD", label: "VOD & Streaming", icon: "🎬" },
  { value: "Nutra", label: "Nutra & Santé", icon: "💊" },
  { value: "Finance", label: "Finance & Crypto", icon: "📈" },
  { value: "Dating", label: "Dating", icon: "💘" },
  { value: "E-commerce", label: "E-commerce", icon: "🛒" },
  { value: "Mobile", label: "Apps & Mobile", icon: "📱" },
];

const VERTICAL_BY_VALUE = new Map(VERTICALS.map((v) => [v.value, v]));

/** Look up a vertical by its stored value; returns undefined for legacy/free-text categories. */
export function getVertical(value: string): Vertical | undefined {
  return VERTICAL_BY_VALUE.get(value);
}

/** Icon for a category value, with a neutral fallback for unknown ones. */
export function verticalIcon(value: string): string {
  return VERTICAL_BY_VALUE.get(value)?.icon ?? "🏷️";
}

/** Label for a category value, falling back to the raw value for legacy categories. */
export function verticalLabel(value: string): string {
  return VERTICAL_BY_VALUE.get(value)?.label ?? value;
}
