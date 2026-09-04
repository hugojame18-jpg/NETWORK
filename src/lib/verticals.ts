// Canonical list of offer categories used across the network. The Offer model
// stores `category` as a free-text string (legacy offers may hold any value),
// but new offers are picked from this list so a category is always spelled and
// grouped consistently.

export interface Vertical {
  /** Stored value in Offer.category — keep stable, it's persisted. */
  value: string;
  /** Human label shown in the UI. */
  label: string;
  /** Emoji icon for compact display on cards and filters. */
  icon: string;
}

export const VERTICALS: Vertical[] = [
  { value: "CC Submit", label: "CC Submit", icon: "💳" },
  { value: "SOI", label: "SOI — Single Opt-In", icon: "✉️" },
  { value: "DOI", label: "DOI — Double Opt-In", icon: "📧" },
  { value: "CPA", label: "CPA", icon: "🎯" },
  { value: "Casino", label: "Casino", icon: "🎰" },
  { value: "Nutra", label: "Nutra", icon: "💊" },
];

const VERTICAL_BY_VALUE = new Map(VERTICALS.map((v) => [v.value, v]));

/** Look up a category by its stored value; undefined for legacy/free-text ones. */
export function getVertical(value: string): Vertical | undefined {
  return VERTICAL_BY_VALUE.get(value);
}

/** Icon for a category value, with a neutral fallback for unknown ones. */
export function verticalIcon(value: string): string {
  return VERTICAL_BY_VALUE.get(value)?.icon ?? "🏷️";
}

/** Label for a category value, falling back to the raw value for legacy ones. */
export function verticalLabel(value: string): string {
  return VERTICAL_BY_VALUE.get(value)?.label ?? value;
}
