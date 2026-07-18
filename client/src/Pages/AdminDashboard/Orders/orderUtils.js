import { getDateRange } from "../Dashboard/dashboardAnalytics";

export const ORDER_DATE_PRESETS = [
  { id: "all", label: "All dates" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7days", label: "Last 7 days" },
  { id: "thisWeek", label: "This week" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "thisYear", label: "This year" },
  { id: "custom", label: "Custom range" },
];

export function getOrderDateRange(preset, customStart, customEnd) {
  if (!preset || preset === "all") return null;
  return getDateRange(preset, customStart, customEnd);
}

export const ORDER_STATUSES = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_ALIASES = {
  pending: "placed",
  processing: "confirmed",
  complete: "delivered",
  completed: "delivered",
};

export function normalizeOrderStatus(status) {
  const value = String(status || "placed").toLowerCase();
  return STATUS_ALIASES[value] || value;
}

export function formatOrderDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatOrderBillingAddress(address, pincode) {
  const addr = String(address || "").trim().replace(/\s+/g, " ");
  const pin = String(pincode || "").trim();

  if (!addr && !pin) return "—";
  if (!addr) return pin;
  if (!pin) return addr;

  const escapedPin = pin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const endsWithPin = new RegExp(`(,\\s*)?${escapedPin}$`).test(addr);
  if (endsWithPin) return addr;

  return `${addr}, ${pin}`;
}

export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getOrderDisplayId(order) {
  if (order?.orderNumber) return order.orderNumber.startsWith("#") ? order.orderNumber : `#${order.orderNumber}`;
  if (order?.displayNumber) return `#${order.displayNumber}`;
  const id = order?._id || order?.id;
  if (id && String(id).startsWith("order-demo-")) {
    return `#${String(id).replace("order-demo-", "")}`;
  }
  return id ? `#${String(id).slice(-6).toUpperCase()}` : "—";
}

export function inferPaymentStatus(order) {
  if (order?.paymentStatus) return order.paymentStatus;
  return "pending";
}

export function normalizeOrder(order) {
  if (!order) return null;

  const products = (order.products || []).map((item) => ({
    ...item,
    variant: item.variant || "—",
    subTotal: item.subTotal ?? Number(item.price || 0) * Number(item.quantity || 0),
  }));

  const subtotal =
    order.subtotal ??
    products.reduce((sum, item) => sum + Number(item.subTotal || 0), 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const shipping = Number(order.shipping || 0);
  const total =
    Number(order.amount) ||
    Math.max(0, subtotal - discount + tax + shipping);

  const status = normalizeOrderStatus(order.status);
  const paymentStatus = inferPaymentStatus(order);
  const date = order.date || order.dateOrdered;

  let statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
  if (!statusHistory.length) {
    statusHistory = [{ status: "placed", date: date || new Date().toISOString() }];
    const flow = ["placed", "confirmed", "packed", "shipped", "delivered"];
    const idx = flow.indexOf(status);
    if (idx > 0) {
      for (let i = 1; i <= idx; i += 1) {
        statusHistory.push({ status: flow[i], date: date || new Date().toISOString() });
      }
    }
    if (status === "cancelled") {
      statusHistory.push({ status: "cancelled", date: date || new Date().toISOString() });
    }
  }

  const paymentMethodLabels = {
    cod: "Cash on delivery",
    bank_transfer: "Direct bank transfer",
  };

  return {
    ...order,
    _id: order._id || order.id,
    id: order._id || order.id,
    products,
    subtotal,
    discount,
    tax,
    shipping,
    total,
    status,
    paymentStatus,
    date,
    statusHistory,
    orderNumber: getOrderDisplayId(order),
    paymentMethod: paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "—",
  };
}

export function getOrderStatusBadgeClass(status) {
  const value = normalizeOrderStatus(status);
  if (value === "delivered") return "completed";
  if (value === "cancelled") return "cancelled";
  if (value === "shipped" || value === "packed") return "processing";
  if (value === "confirmed") return "processing";
  return "pending";
}

export function getPaymentStatusBadgeClass(status) {
  if (status === "paid") return "completed";
  if (status === "failed" || status === "refunded") return "cancelled";
  return "pending";
}

export function getTimelineSteps(currentStatus) {
  const status = normalizeOrderStatus(currentStatus);
  if (status === "cancelled") {
    return [
      { value: "placed", label: "Placed", completed: true, active: false },
      { value: "cancelled", label: "Cancelled", completed: true, active: true, cancelled: true },
    ];
  }

  const flow = ORDER_STATUSES.filter((item) => item.value !== "cancelled").map((item) => item.value);
  const activeIndex = Math.max(0, flow.indexOf(status));

  return flow.map((value, index) => ({
    value,
    label: ORDER_STATUSES.find((item) => item.value === value)?.label || value,
    completed: index <= activeIndex,
    active: index === activeIndex,
  }));
}
