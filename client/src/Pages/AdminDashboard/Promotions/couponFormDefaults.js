export const COUPON_FORM_TABS = [
  { id: "basic", label: "Coupon" },
  { id: "rules", label: "Rules" },
];

export const defaultCouponFields = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  startDate: "",
  expiryDate: "",
  usageLimit: "",
  status: "active",
};

export function couponFromRecord(coupon) {
  return {
    code: coupon.code || "",
    discountType: coupon.discountType || "percentage",
    discountValue: coupon.discountValue ?? "",
    minOrderValue: coupon.minOrderValue ?? "",
    maxDiscount: coupon.maxDiscount ?? "",
    startDate: coupon.startDate ? String(coupon.startDate).slice(0, 10) : "",
    expiryDate: coupon.expiryDate ? String(coupon.expiryDate).slice(0, 10) : "",
    usageLimit: coupon.usageLimit ?? "",
    status: coupon.status || "active",
  };
}

export function formToPayload(formFields) {
  return {
    code: String(formFields.code || "").trim().toUpperCase(),
    discountType: formFields.discountType || "percentage",
    discountValue: Number(formFields.discountValue) || 0,
    minOrderValue: Number(formFields.minOrderValue) || 0,
    maxDiscount: Number(formFields.maxDiscount) || 0,
    startDate: formFields.startDate || null,
    expiryDate: formFields.expiryDate || null,
    usageLimit: Number(formFields.usageLimit) || 0,
    status: formFields.status || "active",
  };
}

export function formatCouponDiscount(coupon) {
  if (coupon.discountType === "fixed") {
    return `Rs. ${Number(coupon.discountValue || 0).toLocaleString()}`;
  }
  return `${Number(coupon.discountValue || 0)}%`;
}

export function formatUsage(coupon) {
  const used = coupon.usageCount || 0;
  const limit = coupon.usageLimit || 0;
  if (!limit) return `${used} / Unlimited`;
  return `${used} / ${limit}`;
}
