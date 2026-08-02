/**
 * Storefront pricing helpers — prefer the lowest variant option price
 * when a product has multiple priced variants.
 */

export function collectVariantOptionPrices(product) {
  const prices = [];
  for (const group of product?.variants || []) {
    for (const opt of group?.options || []) {
      const price = Number(opt?.price);
      if (Number.isFinite(price) && price > 0) {
        prices.push(price);
      }
    }
  }
  return prices;
}

export function getLowestVariantPrice(product) {
  const prices = collectVariantOptionPrices(product);
  if (!prices.length) return null;
  return Math.min(...prices);
}

/** Current price shown on product cards / lists. */
export function getDisplayPrice(product) {
  const lowest = getLowestVariantPrice(product);
  if (lowest != null) return lowest;
  const base = Number(product?.price);
  return Number.isFinite(base) ? base : 0;
}

/**
 * Pricing used by product cards: current price, compare-at, and sale badge %.
 */
export function getDisplayPricing(product) {
  const price = getDisplayPrice(product);
  const oldPrice = Number(product?.oldPrice);
  const onSale = Number.isFinite(oldPrice) && oldPrice > price;
  const discount = onSale
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : Number.isFinite(Number(product?.discount)) && Number(product.discount) > 0
      ? Math.round(Number(product.discount))
      : 0;

  return {
    price,
    oldPrice: onSale ? oldPrice : Number.isFinite(oldPrice) ? oldPrice : 0,
    onSale,
    discount,
    hasDiscount: onSale && discount > 0,
  };
}
