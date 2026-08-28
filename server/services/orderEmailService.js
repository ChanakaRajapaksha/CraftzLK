const emailTemplateService = require("./emailTemplateService");
const storeSettingsService = require("./storeSettingsService");
const emailService = require("./emailService");
const {
  formatMoney,
  formatDate,
  formatPaymentMethod,
  formatPaymentStatus,
  buildItemsText,
} = require("../templates/orderEmailLayout");
const { getPasswordResetLogoAttachment } = require("../templates/passwordResetEmail");
const {
  buildOrderPlacedEmail,
  buildOrderConfirmedEmail,
  buildOrderShippedEmail,
  buildOrderDeliveredEmail,
} = require("../templates/orderStatusEmails");

const STATUS_META = {
  placed: {
    code: "order_placed",
    eyebrow: "Order Placed",
    heading: "Thank you for your order!",
    builder: buildOrderPlacedEmail,
  },
  confirmed: {
    code: "order_confirmed",
    eyebrow: "Order Confirmed",
    heading: "Your order is confirmed!",
    builder: buildOrderConfirmedEmail,
  },
  shipped: {
    code: "order_shipped",
    eyebrow: "Order Shipped",
    heading: "Your order is on the way!",
    builder: buildOrderShippedEmail,
  },
  delivered: {
    code: "order_delivered",
    eyebrow: "Order Delivered",
    heading: "Your order has arrived!",
    builder: buildOrderDeliveredEmail,
  },
};

function getStatusHistoryDate(order, status) {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const match = [...history].reverse().find((entry) => entry.status === status);
  if (match?.date) return formatDate(match.date);
  if (match?.changedAt) return formatDate(match.changedAt);
  if (status === order.status) return formatDate(new Date());
  return "—";
}

function extractCity(order) {
  const address = String(order.shippingAddress || order.address || "").trim();
  if (!address) return "—";
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return "—";
}

function estimateDeliveryDate(order) {
  if (order.estimatedDeliveryDate) return formatDate(order.estimatedDeliveryDate);
  const shippedAt = getStatusHistoryDate(order, "shipped");
  if (shippedAt !== "—") {
    const base = new Date();
    base.setDate(base.getDate() + 3);
    return formatDate(base);
  }
  const future = new Date();
  future.setDate(future.getDate() + 5);
  return formatDate(future);
}

function buildItemsListShort(products = []) {
  return (products || [])
    .map((item) => `${item.productTitle || "Product"} × ${Number(item.quantity) || 1}`)
    .join("\n");
}

async function buildOrderEmailContext(order) {
  const settings = await storeSettingsService.get();
  const storeName = settings.general?.storeName || "CraftzLK";
  const supportEmail = settings.general?.contactEmail || "hello@craftzlk.com";
  const currencySymbol = settings.currency?.symbol || "Rs";
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3006").replace(/\/$/, "");
  const orderViewUrl = `${frontendUrl}/orders`;
  const orderId = order._id?.toString?.() || order.id || "";
  const products = order.products || [];

  const deliveryAddress = String(order.shippingAddress || order.address || "").trim() || "—";
  const discountFormatted = formatMoney(order.discount, currencySymbol);

  return {
    customerName: order.name || "Customer",
    orderNumber: order.orderNumber || (orderId ? orderId.slice(-8).toUpperCase() : "—"),
    orderDate: formatDate(order.date),
    paymentMethod: formatPaymentMethod(order.paymentMethod),
    paymentStatus: formatPaymentStatus(order.paymentStatus),
    products,
    currencySymbol,
    itemsList: buildItemsText(products, currencySymbol),
    itemsListShort: buildItemsListShort(products),
    subtotal: formatMoney(order.subtotal, currencySymbol),
    deliveryCharge: formatMoney(order.shipping, currencySymbol),
    discount: discountFormatted.replace(/^Rs\.?\s?/, ""),
    tax: formatMoney(order.tax, currencySymbol),
    total: formatMoney(order.amount, currencySymbol),
    deliveryAddress,
    city: extractCity(order),
    postalCode: order.pincode || "—",
    phoneNumber: order.phoneNumber || "—",
    storeName,
    supportEmail,
    frontendUrl,
    orderViewUrl,
    reviewUrl: `${frontendUrl}/products`,
    trackingNumber: order.trackingNumber || "Will be shared soon",
    courierName: order.courierName || "CraftzLK Delivery Partner",
    trackingUrl: order.trackingUrl || orderViewUrl,
    shippedDate: getStatusHistoryDate(order, "shipped"),
    deliveredDate: getStatusHistoryDate(order, "delivered"),
    estimatedDeliveryDate: estimateDeliveryDate(order),
  };
}

async function sendOrderStatusEmail(order, statusKey) {
  if (!order?.email) return null;

  const meta = STATUS_META[statusKey];
  if (!meta) return null;

  const ctx = await buildOrderEmailContext(order);
  if (statusKey === "shipped" || statusKey === "delivered") {
    ctx.itemsList = ctx.itemsListShort;
  }

  return emailTemplateService.sendTemplatedEmail({
    code: meta.code,
    to: order.email,
    variables: ctx,
    eyebrow: meta.eyebrow,
    heading: meta.heading,
    fallback: async () => {
      const built = meta.builder(ctx);
      const logoAttachment = getPasswordResetLogoAttachment();
      return {
        subject: built.subject,
        text: built.text,
        html: built.html,
        attachments: logoAttachment ? [logoAttachment] : [],
      };
    },
  });
}

function queueOrderStatusEmail(order, statusKey) {
  sendOrderStatusEmail(order, statusKey).catch((error) => {
    console.error(
      `[orderEmailService] Failed to send ${statusKey} email for order ${order?.orderNumber || order?._id}:`,
      error.message
    );
  });
}

module.exports = {
  buildOrderEmailContext,
  sendOrderStatusEmail,
  queueOrderStatusEmail,
};
