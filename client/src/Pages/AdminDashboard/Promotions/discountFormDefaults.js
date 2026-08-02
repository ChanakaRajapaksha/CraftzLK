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

export function buildVariantSelectionKey(productId, variantName, optionLabel) {
  return `${productId}::${variantName || ""}::${optionLabel || ""}`;
}

export const defaultDiscountFields = {
  name: "",
  type: "product",
  discountType: "percentage",
  discountValue: "",
  productIds: [],
  productNames: [],
  variantTargets: [],
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
    productIds: (record.productIds || []).map(String),
    productNames: record.productNames || [],
    variantTargets: (record.variantTargets || []).map((target) => ({
      productId: String(target.productId || ""),
      productName: target.productName || "",
      variantName: target.variantName || "",
      optionLabel: target.optionLabel || "",
      optionId: target.optionId ? String(target.optionId) : "",
      selectionKey:
        target.selectionKey ||
        buildVariantSelectionKey(target.productId, target.variantName, target.optionLabel),
    })),
    categoryId: record.categoryId || "",
    categoryName: record.categoryName || "",
    description: record.description || "",
    startDate: record.startDate ? String(record.startDate).slice(0, 10) : "",
    endDate: record.endDate ? String(record.endDate).slice(0, 10) : "",
    status: record.status || "active",
  };
}

export function formToPayload(formFields) {
  const base = {
    name: formFields.name,
    type: formFields.type,
    discountType: formFields.discountType || "percentage",
    discountValue: Number(formFields.discountValue) || 0,
    startDate: formFields.startDate || null,
    endDate: formFields.endDate || null,
    status: formFields.status || "active",
  };

  if (formFields.type === "category") {
    return {
      ...base,
      categoryId: formFields.categoryId || "",
      categoryName: formFields.categoryName || "",
      productIds: [],
      productNames: [],
      variantTargets: [],
      description: "",
    };
  }

  if (formFields.type === "seasonal") {
    return {
      ...base,
      description: formFields.description || "",
      productIds: [],
      productNames: [],
      variantTargets: [],
      categoryId: "",
      categoryName: "",
    };
  }

  return {
    ...base,
    productIds: (formFields.productIds || []).map(String),
    productNames: formFields.productNames || [],
    variantTargets: (formFields.variantTargets || []).map((target) => ({
      productId: String(target.productId || ""),
      productName: target.productName || "",
      variantName: target.variantName || "",
      optionLabel: target.optionLabel || "",
      optionId: target.optionId ? String(target.optionId) : "",
    })),
    categoryId: "",
    categoryName: "",
    description: "",
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
    const variantLabels = (discount.variantTargets || []).map((target) => {
      const option = target.optionLabel || "";
      const group = target.variantName || "";
      const product = target.productName || "";
      if (product && group && option) return `${product} (${group}: ${option})`;
      if (product && option) return `${product} (${option})`;
      return option || product;
    }).filter(Boolean);

    if (variantLabels.length) {
      return variantLabels.slice(0, 2).join(", ") + (variantLabels.length > 2 ? ` +${variantLabels.length - 2}` : "");
    }

    const names = discount.productNames || [];
    if (names.length) return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "");
    return `${(discount.productIds || []).length} products`;
  }
  if (discount.type === "category") {
    return discount.categoryName || "Category";
  }
  return discount.description || "Seasonal promotion";
}

export function productHasSelectableVariants(product) {
  return (product.variants || []).some((group) =>
    (group.options || []).some((option) => option.label)
  );
}
