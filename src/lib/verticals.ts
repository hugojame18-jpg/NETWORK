// Canonical list of offer categories used across the network.
//
// RevNetwork runs CC Submit traffic, so the taxonomy is the flow an offer uses
// to convert, not a product vertical. The Offer model stores `category` as a
// free-text string (legacy offers may hold any value), but new offers are
// picked from this list so a category is always spelled and grouped the same.

export interface Vertical {
  /** Stored value in Offer.category — keep stable, it's persisted. */
  value: string;
  /** Human label shown in the UI. */
  label: string;
  /** Emoji icon for compact display on cards and filters. */
  icon: string;
  /** One line explaining the flow, shown to affiliates. */
  description: string;
}

export const VERTICALS: Vertical[] = [
  {
    value: "CC Submit",
    label: "CC Submit",
    icon: "💳",
    description: "L'utilisateur renseigne sa carte pour un essai. Le cœur du réseau.",
  },
  {
    value: "Trial",
    label: "Trial",
    icon: "🎁",
    description: "Essai gratuit ou à prix réduit, facturé ensuite.",
  },
  {
    value: "SOI",
    label: "SOI — Single Opt-In",
    icon: "✉️",
    description: "Un simple email suffit à valider le lead.",
  },
  {
    value: "DOI",
    label: "DOI — Double Opt-In",
    icon: "📧",
    description: "Le lead doit confirmer son email pour compter.",
  },
  {
    value: "CPA",
    label: "CPA",
    icon: "🎯",
    description: "Paiement à l'action réalisée : achat, inscription complète.",
  },
  {
    value: "PIN Submit",
    label: "PIN Submit",
    icon: "📱",
    description: "Validation par code reçu par SMS.",
  },
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
