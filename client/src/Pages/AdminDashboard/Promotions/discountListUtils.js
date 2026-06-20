const SAMPLE_DISCOUNTS = [
  {
    _id: "sample-discount-1",
    id: "sample-discount-1",
    name: "Handloom Saree Offer",
    type: "product",
    discountType: "percentage",
    discountValue: 20,
    productIds: ["p1", "p2"],
    productNames: ["Kandyan Silk Saree", "Handloom Cotton Saree"],
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    status: "active",
  },
  {
    _id: "sample-discount-2",
    id: "sample-discount-2",
    name: "Home Decor Category Sale",
    type: "category",
    discountType: "percentage",
    discountValue: 15,
    categoryId: "cat-home",
    categoryName: "Home Decor",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    status: "active",
  },
  {
    _id: "sample-discount-3",
    id: "sample-discount-3",
    name: "Vesak Season Sale",
    type: "seasonal",
    discountType: "percentage",
    discountValue: 30,
    description: "Celebrate Vesak with handmade gifts and décor.",
    startDate: "2026-05-01",
    endDate: "2026-05-15",
    status: "scheduled",
  },
  {
    _id: "sample-discount-4",
    id: "sample-discount-4",
    name: "Ceramic Collection",
    type: "product",
    discountType: "fixed",
    discountValue: 750,
    productIds: ["p3"],
    productNames: ["Matte Ceramic Vase Set"],
    startDate: "2026-01-15",
    endDate: "2026-02-28",
    status: "expired",
  },
];

export function getDiscountListSampleData() {
  return SAMPLE_DISCOUNTS.map((item) => ({ ...item }));
}

export function isSampleDiscountId(id) {
  return String(id || "").startsWith("sample-discount-");
}
