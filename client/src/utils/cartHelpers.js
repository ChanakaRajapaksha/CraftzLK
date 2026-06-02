import { getSampleProductById } from "../data/sampleProductDetails";

export const LOCAL_CART_KEY = "craftzlk_local_cart";

export const CRAFT_MILESTONES = [
  { threshold: 3000, label: "Artisan note", shortLabel: "Artisan note" },
  { threshold: 7500, label: "Gift packaging", shortLabel: "Gift packaging" },
  { threshold: 12000, label: "Island delivery", shortLabel: "Island delivery" },
];

export function isSampleProductId(productId) {
  return Boolean(productId && getSampleProductById(productId));
}

export function parsePriceValue(value) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return Number(String(value ?? "0").replace(/[^\d.]/g, "")) || 0;
}

export function formatRs(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getCartSubtotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce(
    (sum, item) => sum + parsePriceValue(item.price) * (item.quantity || 1),
    0
  );
}

export function getCartItemCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function getMilestoneProgress(subtotal) {
  const max = CRAFT_MILESTONES[CRAFT_MILESTONES.length - 1].threshold;
  return Math.min(100, (subtotal / max) * 100);
}

export function loadLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function buildCartPayloadFromSample(product, quantity = 1) {
  const qty = Math.max(1, quantity);
  const price = parsePriceValue(product.price);
  return {
    productTitle: product.name,
    image: product.images?.[0] ?? "",
    rating: product.rating ?? 5,
    price,
    quantity: qty,
    subTotal: price * qty,
    productId: product.id,
    countInStock: product.countInStock ?? 99,
  };
}

export function addToLocalCart(items, payload) {
  const list = Array.isArray(items) ? [...items] : [];
  const idx = list.findIndex((i) => i.productId === payload.productId);
  if (idx >= 0) {
    const nextQty = list[idx].quantity + payload.quantity;
    list[idx] = {
      ...list[idx],
      quantity: nextQty,
      subTotal: parsePriceValue(list[idx].price) * nextQty,
    };
  } else {
    list.push({
      ...payload,
      id: `local-${payload.productId}`,
      _id: `local-${payload.productId}`,
    });
  }
  return list;
}

export function updateLocalCartQty(items, itemId, quantity) {
  const list = Array.isArray(items) ? [...items] : [];
  const qty = Math.max(1, quantity);
  return list.map((item) => {
    if (item.id !== itemId && item._id !== itemId) return item;
    const price = parsePriceValue(item.price);
    return { ...item, quantity: qty, subTotal: price * qty };
  });
}

export function removeFromLocalCart(items, itemId) {
  return (Array.isArray(items) ? items : []).filter(
    (item) => item.id !== itemId && item._id !== itemId
  );
}
