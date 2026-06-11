export const LOCAL_ORDERS_KEY = "craftzlk_local_orders";

export function loadLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrders(orders) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

export function addLocalOrder(order) {
  if (!order?.orderId) return loadLocalOrders();

  const orders = loadLocalOrders();
  if (orders.some((entry) => entry.orderId === order.orderId)) {
    return orders;
  }

  const enriched = {
    ...order,
    status: order.status || "confirmed",
    placedAt: order.placedAt || Date.now(),
  };

  const next = [enriched, ...orders];
  saveLocalOrders(next);
  return next;
}

export function getOrderItemCount(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}
