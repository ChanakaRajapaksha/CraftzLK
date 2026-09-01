/**
 * Shared variant helpers for admin, product details, and shop cards.
 * Only applies when a product has purchasable variant options.
 */

export function hasProductVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.some(
    (group) =>
      Array.isArray(group?.options) &&
      group.options.some((opt) => opt?.label || opt?.image || opt?.sku)
  );
}

export function getPrimaryVariantGroup(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;

  return (
    variants.find((group) => /color/i.test(String(group?.variantName || ""))) ||
    variants[0]
  );
}

export function getDefaultVariantOption(product) {
  const group = getPrimaryVariantGroup(product);
  const options = (group?.options || []).filter(
    (opt) => opt?.label || opt?.sku || opt?.image
  );
  if (!options.length) return null;

  return options.find((opt) => opt.isDefault) || options[0];
}

export function formatVariantProductName(parentName, variantLabel) {
  const base = String(parentName || "").trim();
  const label = String(variantLabel || "").trim();
  if (!base) return label;
  if (!label) return base;
  return `${base} – ${label}`;
}

export function normalizeVariantGroupDefaults(options = []) {
  if (!options.length) return [];

  const defaultIndex = options.findIndex((opt) => opt.isDefault);
  const resolvedIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return options.map((opt, index) => ({
    ...opt,
    isDefault: index === resolvedIndex,
  }));
}
