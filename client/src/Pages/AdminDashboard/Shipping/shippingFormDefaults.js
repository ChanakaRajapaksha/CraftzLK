export const SHIPPING_ZONES = [
  "Western Province",
  "Other Provinces",
  "International",
];

export const defaultShippingMethodFields = {
  name: "",
  cost: "",
  actualShippingCost: "",
  deliveryTime: "",
  zones: [],
  status: "active",
};

export function methodFromRecord(record) {
  return {
    name: record.name || "",
    cost: record.cost ?? "",
    actualShippingCost: record.actualShippingCost ?? "",
    deliveryTime: record.deliveryTime || "",
    zones: record.zones || [],
    status: record.status || "active",
  };
}

export function formToPayload(formFields) {
  return {
    name: formFields.name,
    cost: Number(formFields.cost) || 0,
    actualShippingCost:
      formFields.actualShippingCost === "" || formFields.actualShippingCost == null
        ? null
        : Number(formFields.actualShippingCost),
    deliveryTime: formFields.deliveryTime || "",
    zones: formFields.zones || [],
    status: formFields.status || "active",
  };
}

export function formatZones(zones = []) {
  if (!zones.length) return "—";
  return zones.join(", ");
}

export function formatCost(cost) {
  if (cost === null || cost === undefined || cost === "") return "N/A";
  return `Rs ${Number(cost).toLocaleString()}`;
}
