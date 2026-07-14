/**
 * Maps a live API product into the SampleProductDetails view model
 * without changing the existing storefront product details design.
 */

const DEFAULT_TRUST_BADGES = [
  { id: "authentic", label: "100% Authentic" },
  { id: "delivery", label: "Island wide Delivery" },
  { id: "express", label: "Express Delivery: Colombo 1-12" },
];

const DEFAULT_DISCLAIMER =
  "Actual product colors may vary slightly from the images shown on our website/app.";

/** Dummy review values until live reviews are connected */
export const DUMMY_PRODUCT_RATING = 4;
export const DUMMY_REVIEW_COUNT = 128;

function formatPriceDisplay(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Rs 0.00";
  return `Rs ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseDescriptionPoints(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((point) => ({
        title: String(point?.title || "").trim(),
        text: String(point?.text || "").trim(),
      }))
      .filter((point) => point.title || point.text);
  }
  if (typeof value === "object" && Array.isArray(value.points)) {
    return value.points
      .map((point) => ({
        title: String(point?.title || "").trim(),
        text: String(point?.text || "").trim(),
      }))
      .filter((point) => point.title || point.text);
  }
  if (typeof value === "string" && value.trim()) {
    return [{ title: "", text: value.trim() }];
  }
  return [];
}

function buildColorsFromVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return [];

  const colorGroup =
    variants.find((group) => /color/i.test(String(group?.variantName || ""))) ||
    variants[0];

  const options = Array.isArray(colorGroup?.options) ? colorGroup.options : [];
  return options
    .map((opt, index) => {
      const label = String(opt?.label || "").trim();
      const image = String(opt?.image || "").trim() || product?.images?.[index] || product?.images?.[0];
      if (!label && !image) return null;
      return {
        id: String(opt?.sku || label || `option-${index}`),
        label: label || `Option ${index + 1}`,
        image: image || "",
      };
    })
    .filter(Boolean);
}

function hasVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.some(
    (group) =>
      Array.isArray(group?.options) &&
      group.options.some((opt) => opt?.label || opt?.image || opt?.sku)
  );
}

function parseShortBullets(value) {
  if (!value) return [];
  if (typeof value === "object" && Array.isArray(value.bullets)) {
    return value.bullets.map((line) => String(line || "").trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split("\n").map((line) => line.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Normalize API / DB product into the details page display shape.
 */
export function mapApiProductToDetailsView(apiProduct) {
  if (!apiProduct) return null;

  const id = String(apiProduct.id || apiProduct._id || "");
  const points = parseDescriptionPoints(apiProduct.description);
  const detailedDescription = points.map((point) => ({
    title: point.title || "Detail",
    text: point.text || "",
  }));

  // Short Description section → shortDescription.bullets (fallback: Full Description titles)
  // Product details section → Full Description points (title + text)
  const shortFromField = parseShortBullets(apiProduct.shortDescription);
  const shortFromFullDescription = points
    .map((point) => point.title || point.text)
    .filter(Boolean);
  const shortBullets =
    shortFromField.length > 0 ? shortFromField : shortFromFullDescription;

  const variantsExist = hasVariants(apiProduct);
  const colors = variantsExist ? buildColorsFromVariants(apiProduct) : [];

  return {
    id,
    name: apiProduct.name || "",
    images: Array.isArray(apiProduct.images) ? apiProduct.images.filter(Boolean) : [],
    rating: DUMMY_PRODUCT_RATING,
    reviewCount: DUMMY_REVIEW_COUNT,
    countInStock: Number(apiProduct.countInStock) || 0,
    price: Number(apiProduct.price) || 0,
    oldPrice: Number(apiProduct.oldPrice) || 0,
    priceDisplay: formatPriceDisplay(apiProduct.price),
    cashPriceLabel: "CASH PRICE",
    shortDescription: {
      bullets: shortBullets,
      disclaimer: DEFAULT_DISCLAIMER,
    },
    detailedDescription,
    colors,
    hasVariants: variantsExist,
    trustBadges: DEFAULT_TRUST_BADGES,
    variants: apiProduct.variants || [],
    brand: apiProduct.brand || "",
    status: apiProduct.status || "active",
  };
}

export function isValidApiProduct(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      !data.response &&
      !(typeof data.message === "string" && data.message.toLowerCase().includes("not found")) &&
      (data._id || data.id || data.name)
  );
}
