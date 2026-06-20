export const DISCOUNT_FORM_TABS = [
  { id: "basic", label: "Details" },
  { id: "target", label: "Target" },
  { id: "schedule", label: "Schedule" },
];

export const DISCOUNT_TYPES = [
  { value: "product", label: "Product Discount" },
  { value: "category", label: "Category Discount" },
  { value: "seasonal", label: "Seasonal Sale" },
];

export const defaultDiscountFields = {
  name: "",
  type: "product",
  discountType: "percentage",
  discountValue: "",
  productIds: [],
  productNames: [],
  categoryId: "",
  categoryName: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "active",
};

export function discountFromRecord(record) {
  return {
    name: record.name || "",
    type: record.type || "product",
    discountType: record.discountType || "percentage",
    discountValue: record.discountValue ?? "",
    productIds: record.productIds || [],
    productNames: record.productNames || [],
    categoryId: record.categoryId || "",
    categoryName: record.categoryName || "",
    description: record.description || "",
    startDate: record.startDate ? String(record.startDate).slice(0, 10) : "",
    endDate: record.endDate ? String(record.endDate).slice(0, 10) : "",
    status: record.status || "active",
  };
}

export function formToPayload(formFields) {
  return {
    name: formFields.name,
    type: formFields.type,
    discountType: formFields.discountType || "percentage",
    discountValue: Number(formFields.discountValue) || 0,
    productIds: formFields.productIds || [],
    productNames: formFields.productNames || [],
    categoryId: formFields.categoryId || "",
    categoryName: formFields.categoryName || "",
    description: formFields.description || "",
    startDate: formFields.startDate || null,
    endDate: formFields.endDate || null,
    status: formFields.status || "active",
  };
}

export function formatDiscountValue(discount) {
  if (discount.discountType === "fixed") {
    return `Rs. ${Number(discount.discountValue || 0).toLocaleString()}`;
  }
  return `${Number(discount.discountValue || 0)}%`;
}

export function formatDiscountType(type) {
  const map = {
    product: "Product Discount",
    category: "Category Discount",
    seasonal: "Seasonal Sale",
  };
  return map[type] || type;
}

export function formatDiscountTarget(discount) {
  if (discount.type === "product") {
    const names = discount.productNames || [];
    if (names.length) return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "");
    return `${(discount.productIds || []).length} products`;
  }
  if (discount.type === "category") {
    return discount.categoryName || "Category";
  }
  return discount.description || "Seasonal promotion";
}
