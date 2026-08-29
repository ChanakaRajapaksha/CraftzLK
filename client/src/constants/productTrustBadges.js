export const DEFAULT_TRUST_BADGES = {
  authentic: "100% Authentic",
  delivery: "Island wide Delivery",
  express: "Express Delivery: Colombo 1-12",
};

export const TRUST_BADGE_FORM_FIELDS = [
  {
    id: "authentic",
    label: "Point 1 — Authenticity",
    placeholder: DEFAULT_TRUST_BADGES.authentic,
    hint: "Displayed with the shield icon on the product details page.",
  },
  {
    id: "delivery",
    label: "Point 2 — Delivery",
    placeholder: DEFAULT_TRUST_BADGES.delivery,
    hint: "Displayed with the truck icon on the product details page.",
  },
  {
    id: "express",
    label: "Point 3 — Express delivery",
    placeholder: DEFAULT_TRUST_BADGES.express,
    hint: "Displayed with the sparkle icon on the product details page.",
  },
];

export function normalizeTrustBadges(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    authentic: String(source.authentic ?? DEFAULT_TRUST_BADGES.authentic).trim(),
    delivery: String(source.delivery ?? DEFAULT_TRUST_BADGES.delivery).trim(),
    express: String(source.express ?? DEFAULT_TRUST_BADGES.express).trim(),
  };
}

export function trustBadgesToDisplayList(trustBadges) {
  const normalized = normalizeTrustBadges(trustBadges);

  return TRUST_BADGE_FORM_FIELDS.map(({ id }) => ({
    id,
    label: normalized[id],
  })).filter((badge) => badge.label);
}
