import { fetchDataFromApi } from "./api";

export function getOrderItemCount(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function normalizeOrderStatus(status) {
  const value = String(status || "confirmed").toLowerCase();
  if (value === "placed" || value === "processing") return "confirmed";
  return value;
}

export function getOrderStatusLabel(status) {
  const value = normalizeOrderStatus(status);
  const labels = {
    confirmed: "Confirmed",
    packed: "Handcrafting",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[value] || "Confirmed";
}

export function getPaymentStatusLabel(paymentStatus) {
  const value = String(paymentStatus || "pending").toLowerCase();
  if (value === "paid") return "Paid";
  if (value === "failed") return "Failed";
  if (value === "refunded") return "Refunded";
  return "Pending";
}

export function mapApiOrderToDisplay(order) {
  const date = order?.date
    ? new Date(order.date).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  const products = Array.isArray(order?.products) ? order.products : [];
  const status = normalizeOrderStatus(order?.status);

  return {
    orderId: order.orderNumber || order.paymentId || order.id,
    orderNumber: order.orderNumber || "",
    name: order.name,
    firstName: order.name?.split(" ")[0] || "",
    email: order.email,
    phoneNumber: order.phoneNumber || "",
    address: order.address || "",
    shippingAddress: order.shippingAddress || "",
    paymentMethod: order.paymentMethod || "",
    paymentStatus: order.paymentStatus || "pending",
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping ?? 0,
    total: parseFloat(order.amount) || 0,
    date,
    status,
    orderNotes: order.orderNotes || "",
    items: products.map((product) => ({
      id: product.productId,
      title: product.productTitle,
      variant: product.variant || "",
      quantity: product.quantity || 1,
      lineTotal:
        product.subTotal ?? (product.price || 0) * (product.quantity || 1),
    })),
  };
}

export function getTimelineDoneCount(status) {
  const value = normalizeOrderStatus(status);
  const stepMap = {
    confirmed: 1,
    packed: 2,
    shipped: 3,
    delivered: 4,
  };
  return stepMap[value] ?? 1;
}

export function getOrderBadgeClass(status) {
  const value = normalizeOrderStatus(status);
  if (value === "packed" || value === "shipped") return "processing";
  if (value === "delivered") return "confirmed";
  if (value === "cancelled") return "processing";
  return "confirmed";
}

export async function fetchUserOrders() {
  const res = await fetchDataFromApi("/api/orders");
  const list = Array.isArray(res) ? res : [];

  return list
    .map(mapApiOrderToDisplay)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
