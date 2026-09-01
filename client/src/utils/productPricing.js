/**
 * Storefront pricing helpers for product cards and lists.
 * Products without variants use the main Pricing tab price.
 * Products with variants use the default variant price on cards.
 */

import {
  getDefaultVariantOption,
  hasProductVariants,
} from "./productVariants.js";

export {
  formatVariantProductName,
  getDefaultVariantOption,
  getPrimaryVariantGroup,
  hasProductVariants,
} from "./productVariants.js";

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

export function hasPricedVariants(product) {
  return collectVariantOptionPrices(product).length > 0;
}

/** Current price on product cards / lists. */
export function getDisplayPrice(product) {
  if (hasProductVariants(product)) {
    const defaultOption = getDefaultVariantOption(product);
    const variantPrice = Number(defaultOption?.price);
    if (Number.isFinite(variantPrice) && variantPrice > 0) {
      return variantPrice;
    }
  }

  const base = Number(product?.price);
  return Number.isFinite(base) ? base : 0;
}

/** Stock shown on product cards for variant products. */
export function getDisplayStock(product) {
  if (hasProductVariants(product)) {
    const defaultOption = getDefaultVariantOption(product);
    if (defaultOption) {
      return {
        count: Math.max(0, Number(defaultOption.stock) || 0),
        status: defaultOption.stockStatus || "in_stock",
      };
    }
  }

  return {
    count: Math.max(0, Number(product?.countInStock) || 0),
    status: product?.stockStatus || "in_stock",
  };
}

/** Primary card image — default variant image when available. */
export function getDisplayPrimaryImage(product, fallback = "") {
  if (hasProductVariants(product)) {
    const defaultOption = getDefaultVariantOption(product);
    if (defaultOption?.image) return defaultOption.image;
  }

  const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  return images[0] || fallback;
}

/** Pricing used by product cards: current price, compare-at, and sale badge %. */
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
