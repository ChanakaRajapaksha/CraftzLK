export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export function formatCustomerDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAddress(address) {
  if (!address) return "—";
  if (typeof address === "string") return address || "—";
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function normalizeCustomer(customer) {
  if (!customer) return null;

  return {
    ...customer,
    _id: customer._id || customer.id,
    id: customer._id || customer.id,
    name: customer.name || "—",
    email: customer.email || "—",
    phone: customer.phone || customer.phoneNumber || "—",
    images: customer.images || [],
    address: customer.address || {},
    addressLine: customer.addressLine || formatAddress(customer.address),
    status: customer.status || (customer.isActive === false ? "inactive" : "active"),
    orderCount: Number(customer.orderCount || 0),
    totalSpend: Number(customer.totalSpend || 0),
    orders: customer.orders || [],
    reviews: customer.reviews || [],
    wishlist: customer.wishlist || [],
    joinedAt: customer.joinedAt || customer.createdAt,
  };
}

export function getCustomerStatusBadgeClass(status) {
  return status === "active" ? "completed" : "cancelled";
}
