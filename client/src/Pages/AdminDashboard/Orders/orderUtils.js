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
  const value = String(status || "confirmed").toLowerCase();
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

export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `Rs ${amount.toLocaleString("en-LK")}`;
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
  if (order?.paymentMethod === "bank_transfer") return "paid";
  if (order?.paymentMethod === "cod") return "pending";
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
    statusHistory = [{ status: "confirmed", date: date || new Date().toISOString() }];
    const flow = ["confirmed", "packed", "shipped", "delivered"];
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

export function buildInvoiceHtml(order) {
  const normalized = normalizeOrder(order);
  const rows = (normalized.products || [])
    .map(
      (item) => `
        <tr>
          <td>${item.productTitle || "Product"}</td>
          <td>${item.variant || "—"}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(item.subTotal)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${normalized.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #222; padding: 32px; }
    h1 { margin: 0 0 8px; }
    .meta { color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom: 1px solid #ddd; padding: 10px 8px; text-align: left; }
    .totals { margin-top: 20px; width: 280px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { font-weight: bold; font-size: 1.1rem; border-top: 1px solid #333; margin-top: 8px; padding-top: 8px; }
  </style>
</head>
<body>
  <h1>CraftzLK Invoice</h1>
  <div class="meta">
    <div>Order: ${normalized.orderNumber}</div>
    <div>Date: ${formatOrderDate(normalized.date)}</div>
    <div>Customer: ${normalized.name}</div>
  </div>
  <table>
    <thead>
      <tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(normalized.subtotal)}</span></div>
    <div><span>Discount</span><span>- ${formatCurrency(normalized.discount)}</span></div>
    <div><span>Tax</span><span>${formatCurrency(normalized.tax)}</span></div>
    <div><span>Shipping</span><span>${formatCurrency(normalized.shipping)}</span></div>
    <div class="grand"><span>Total</span><span>${formatCurrency(normalized.total)}</span></div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

export function printOrderInvoice(order) {
  const html = buildInvoiceHtml(order);
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export function downloadOrderPdf(order) {
  printOrderInvoice(order);
}
