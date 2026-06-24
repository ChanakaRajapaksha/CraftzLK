import { fetchDataFromApi } from "./api";

export function getOrderItemCount(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
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

  return {
    orderId: order.paymentId || order.orderNumber || order.id,
    name: order.name,
    firstName: order.name?.split(" ")[0] || "",
    email: order.email,
    paymentMethod: order.paymentMethod || "",
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping ?? 0,
    total: parseFloat(order.amount) || 0,
    date,
    status: order.status || "placed",
    items: products.map((product) => ({
      id: product.productId,
      title: product.productTitle,
      quantity: product.quantity || 1,
      lineTotal:
        product.subTotal ?? (product.price || 0) * (product.quantity || 1),
    })),
  };
}

export async function fetchUserOrders(userId) {
  if (!userId) return [];

  const res = await fetchDataFromApi(`/api/orders?userid=${userId}`);
  const list = Array.isArray(res) ? res : [];

  return list
    .map(mapApiOrderToDisplay)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
