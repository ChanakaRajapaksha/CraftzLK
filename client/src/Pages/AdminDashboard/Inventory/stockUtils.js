export function getStockLevel(item) {
  const stock = Number(item.countInStock ?? 0);
  const min = Number(item.minStockAlert ?? 5);
  if (stock <= 0) return "out_of_stock";
  if (stock <= min) return "low_stock";
  return "in_stock";
}

export function getStockLevelLabel(level) {
  const map = {
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
  };
  return map[level] || level;
}

export function getStockLevelBadgeClass(level) {
  if (level === "in_stock") return "completed";
  if (level === "low_stock") return "pending";
  return "cancelled";
}

export function getStockPillClass(item) {
  const level = getStockLevel(item);
  if (level === "out_of_stock") return " admin-dash__stock-pill--out";
  if (level === "low_stock") return " admin-dash__stock-pill--low";
  return "";
}

export const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock alert" },
  { value: "out_of_stock", label: "Out of stock" },
];

export const STOCK_ACTIONS = [
  { value: "add", label: "Add Stock" },
  { value: "remove", label: "Remove Stock" },
];

export const defaultStockAdjustmentFields = {
  productId: "",
  quantity: "",
  action: "add",
  reason: "",
};
