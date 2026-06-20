const SAMPLE_METHODS = [
  {
    _id: "sample-shipping-1",
    id: "sample-shipping-1",
    name: "Standard Delivery",
    cost: 350,
    deliveryTime: "3–5 business days",
    zones: ["Western Province", "Other Provinces"],
    status: "active",
  },
  {
    _id: "sample-shipping-2",
    id: "sample-shipping-2",
    name: "Express Delivery",
    cost: 750,
    deliveryTime: "1–2 business days",
    zones: ["Western Province"],
    status: "active",
  },
  {
    _id: "sample-shipping-3",
    id: "sample-shipping-3",
    name: "International Shipping",
    cost: 4500,
    deliveryTime: "7–14 business days",
    zones: ["International"],
    status: "active",
  },
  {
    _id: "sample-shipping-4",
    id: "sample-shipping-4",
    name: "Island-wide Economy",
    cost: 500,
    deliveryTime: "5–7 business days",
    zones: ["Other Provinces"],
    status: "inactive",
  },
];

export function getShippingMethodSampleData() {
  return SAMPLE_METHODS.map((item) => ({ ...item }));
}

export function isSampleShippingMethodId(id) {
  return String(id || "").startsWith("sample-shipping-");
}
