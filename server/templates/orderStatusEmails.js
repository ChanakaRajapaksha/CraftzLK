const {
  escapeHtml,
  buildItemsText,
  buildItemsHtml,
  buildTotalsBlock,
  buildSection,
  buildButton,
  buildOrderEmailShell,
} = require("./orderEmailLayout");

function buildOrderPlacedEmail(ctx) {
  const subject = `Order ${ctx.orderNumber} Received – Thank You for Your Order!`;

  const text = [
    `Hi ${ctx.customerName},`,
    "",
    `Thank you for shopping with ${ctx.storeName}!`,
    "",
    "We've received your order and it has been successfully placed. We're currently reviewing and preparing your order for processing.",
    "",
    "ORDER DETAILS",
    "────────────────────────────",
    `Order Number: ${ctx.orderNumber}`,
    `Order Date: ${ctx.orderDate}`,
    `Payment Method: ${ctx.paymentMethod}`,
    `Payment Status: ${ctx.paymentStatus}`,
    "",
    "ITEMS",
    "────────────────────────────",
    buildItemsText(ctx.products, ctx.currencySymbol),
    "",
    "────────────────────────────",
    `Subtotal:        ${ctx.subtotal}`,
    `Delivery:        ${ctx.deliveryCharge}`,
    `Discount:        -${ctx.discount}`,
    `Tax:             ${ctx.tax}`,
    `Total:           ${ctx.total}`,
    "",
    "DELIVERY DETAILS",
    "────────────────────────────",
    ctx.customerName,
    ctx.deliveryAddress,
    `${ctx.city}, ${ctx.postalCode}`,
    ctx.phoneNumber,
    "",
    "WHAT'S NEXT?",
    "",
    "We'll send you another email once your order has been confirmed and is ready to move to the next stage.",
    "",
    `View Your Order: ${ctx.orderViewUrl}`,
    "",
    "Thank you for supporting local craftsmanship.",
    "",
    `Warm regards,`,
    `The ${ctx.storeName} Team`,
    "",
    `Need help with your order? Contact us at ${ctx.supportEmail}`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Hi ${escapeHtml(ctx.customerName)},</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Thank you for shopping with <strong>${escapeHtml(ctx.storeName)}</strong>!</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">We've received your order and it has been successfully placed. We're currently reviewing and preparing your order for processing.</p>
    ${buildSection(
      "Order Details",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Number:</strong> ${escapeHtml(ctx.orderNumber)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Date:</strong> ${escapeHtml(ctx.orderDate)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Payment Method:</strong> ${escapeHtml(ctx.paymentMethod)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;"><strong>Payment Status:</strong> ${escapeHtml(ctx.paymentStatus)}</p>
       <p style="margin:12px 0 0;font-size:14px;color:#5c4033;"><strong>Order Status:</strong> Placed</p>`
    )}
    ${buildSection("Items", buildItemsHtml(ctx.products, ctx.currencySymbol) + buildTotalsBlock(ctx))}
    ${buildSection(
      "Delivery Details",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.customerName)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.deliveryAddress)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.city)}, ${escapeHtml(ctx.postalCode)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;">${escapeHtml(ctx.phoneNumber)}</p>`
    )}
    ${buildSection(
      "What's Next?",
      `<p style="margin:0;font-size:15px;line-height:1.65;color:#5c4033;">We'll send you another email once your order has been confirmed and is ready to move to the next stage.</p>`
    )}
    ${buildButton("View Your Order", ctx.orderViewUrl)}
    <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#5c4033;text-align:center;">Thank you for supporting local craftsmanship.</p>`;

  const { html } = buildOrderEmailShell({
    subject,
    eyebrow: "Order Placed",
    heading: "Thank you for your order!",
    bodyHtml,
    ctx,
  });

  return { subject, text, html };
}

function buildOrderConfirmedEmail(ctx) {
  const subject = `Your Order ${ctx.orderNumber} Has Been Confirmed 🎉`;

  const text = [
    `Hi ${ctx.customerName},`,
    "",
    "Great news!",
    "",
    `Your order ${ctx.orderNumber} has been confirmed and is now being prepared for shipment.`,
    "",
    "ORDER CONFIRMED",
    "────────────────────────────",
    `Order Number: ${ctx.orderNumber}`,
    `Order Date: ${ctx.orderDate}`,
    `Payment Status: ${ctx.paymentStatus}`,
    "Order Status: Confirmed",
    "",
    "ITEMS",
    "────────────────────────────",
    buildItemsText(ctx.products, ctx.currencySymbol),
    "",
    "────────────────────────────",
    `Subtotal:        ${ctx.subtotal}`,
    `Delivery:        ${ctx.deliveryCharge}`,
    `Discount:        -${ctx.discount}`,
    `Tax:             ${ctx.tax}`,
    `Total:           ${ctx.total}`,
    "",
    "DELIVERY TO",
    "────────────────────────────",
    ctx.customerName,
    ctx.deliveryAddress,
    `${ctx.city}, ${ctx.postalCode}`,
    "",
    "WHAT'S NEXT?",
    "",
    "Our team is now preparing your items carefully. Once your order has been handed over to the delivery partner, we'll send you a shipping notification with tracking information.",
    "",
    `View Order Details: ${ctx.orderViewUrl}`,
    "",
    `Thank you for choosing ${ctx.storeName}.`,
    "",
    `Warm regards,`,
    `The ${ctx.storeName} Team`,
    "",
    `Need help? ${ctx.supportEmail}`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Hi ${escapeHtml(ctx.customerName)},</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;"><strong>Great news!</strong></p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Your order <strong>${escapeHtml(ctx.orderNumber)}</strong> has been confirmed and is now being prepared for shipment.</p>
    ${buildSection(
      "Order Confirmed",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Number:</strong> ${escapeHtml(ctx.orderNumber)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Date:</strong> ${escapeHtml(ctx.orderDate)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Payment Status:</strong> ${escapeHtml(ctx.paymentStatus)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;"><strong>Order Status:</strong> Confirmed</p>`
    )}
    ${buildSection("Items", buildItemsHtml(ctx.products, ctx.currencySymbol) + buildTotalsBlock(ctx))}
    ${buildSection(
      "Delivery To",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.customerName)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.deliveryAddress)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;">${escapeHtml(ctx.city)}, ${escapeHtml(ctx.postalCode)}</p>`
    )}
    ${buildSection(
      "What's Next?",
      `<p style="margin:0;font-size:15px;line-height:1.65;color:#5c4033;">Our team is now preparing your items carefully. Once your order has been handed over to the delivery partner, we'll send you a shipping notification with tracking information.</p>`
    )}
    ${buildButton("View Order Details", ctx.orderViewUrl)}
    <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#5c4033;text-align:center;">Thank you for choosing ${escapeHtml(ctx.storeName)}.</p>`;

  const { html } = buildOrderEmailShell({
    subject,
    eyebrow: "Order Confirmed",
    heading: "Your order is confirmed!",
    bodyHtml,
    ctx,
  });

  return { subject, text, html };
}

function buildOrderShippedEmail(ctx) {
  const subject = `Your Order ${ctx.orderNumber} Is On Its Way! 🚚`;
  const trackUrl = ctx.trackingUrl || ctx.orderViewUrl;

  const text = [
    `Hi ${ctx.customerName},`,
    "",
    "Good news - your order is on its way!",
    "",
    `Order ${ctx.orderNumber} has been shipped and is now with our delivery partner.`,
    "",
    "SHIPPING DETAILS",
    "────────────────────────────",
    `Order Number: ${ctx.orderNumber}`,
    `Shipped On: ${ctx.shippedDate}`,
    `Delivery Partner: ${ctx.courierName}`,
    `Tracking Number: ${ctx.trackingNumber}`,
    "",
    "ITEMS",
    "────────────────────────────",
    (ctx.products || [])
      .map((item) => `${item.productTitle || "Product"} × ${item.quantity || 1}`)
      .join("\n"),
    "",
    "DELIVERY ADDRESS",
    "────────────────────────────",
    ctx.customerName,
    ctx.deliveryAddress,
    `${ctx.city}, ${ctx.postalCode}`,
    "",
    "ESTIMATED DELIVERY",
    "────────────────────────────",
    ctx.estimatedDeliveryDate,
    "",
    `Track Your Order: ${trackUrl}`,
    "",
    "Please make sure someone is available at the delivery address to receive your package.",
    "",
    "We'll let you know once your order has been successfully delivered.",
    "",
    `Thank you for shopping with ${ctx.storeName}!`,
    "",
    `Warm regards,`,
    `The ${ctx.storeName} Team`,
    "",
    `Need help with your delivery? ${ctx.supportEmail}`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Hi ${escapeHtml(ctx.customerName)},</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;"><strong>Good news - your order is on its way!</strong></p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Order <strong>${escapeHtml(ctx.orderNumber)}</strong> has been shipped and is now with our delivery partner.</p>
    ${buildSection(
      "Shipping Details",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Number:</strong> ${escapeHtml(ctx.orderNumber)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Shipped On:</strong> ${escapeHtml(ctx.shippedDate)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Delivery Partner:</strong> ${escapeHtml(ctx.courierName)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;"><strong>Tracking Number:</strong> ${escapeHtml(ctx.trackingNumber)}</p>
       <p style="margin:12px 0 0;font-size:14px;color:#5c4033;"><strong>Order Status:</strong> Shipped</p>`
    )}
    ${buildSection("Items", buildItemsHtml(ctx.products, ctx.currencySymbol, false))}
    ${buildSection(
      "Delivery Address",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.customerName)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;">${escapeHtml(ctx.deliveryAddress)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;">${escapeHtml(ctx.city)}, ${escapeHtml(ctx.postalCode)}</p>`
    )}
    ${buildSection(
      "Estimated Delivery",
      `<p style="margin:0;font-size:15px;line-height:1.65;color:#5c4033;">${escapeHtml(ctx.estimatedDeliveryDate)}</p>`
    )}
    ${buildButton("Track Your Order", trackUrl)}
    <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#5c4033;">Please make sure someone is available at the delivery address to receive your package.</p>
    <p style="margin:8px 0 0;font-size:15px;line-height:1.65;color:#5c4033;">We'll let you know once your order has been successfully delivered.</p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#5c4033;text-align:center;">Thank you for shopping with ${escapeHtml(ctx.storeName)}!</p>`;

  const { html } = buildOrderEmailShell({
    subject,
    eyebrow: "Order Shipped",
    heading: "Your order is on the way!",
    bodyHtml,
    ctx,
  });

  return { subject, text, html };
}

function buildOrderDeliveredEmail(ctx) {
  const subject = `Order ${ctx.orderNumber} Has Been Delivered 🎉`;
  const reviewUrl = ctx.reviewUrl || ctx.orderViewUrl;

  const text = [
    `Hi ${ctx.customerName},`,
    "",
    "Your order has arrived!",
    "",
    `We're happy to let you know that order ${ctx.orderNumber} has been successfully delivered.`,
    "",
    "DELIVERY DETAILS",
    "────────────────────────────",
    `Order Number: ${ctx.orderNumber}`,
    `Delivered On: ${ctx.deliveredDate}`,
    `Delivered To: ${ctx.deliveryAddress}`,
    "",
    "ITEMS",
    "────────────────────────────",
    (ctx.products || [])
      .map((item) => `${item.productTitle || "Product"} × ${item.quantity || 1}`)
      .join("\n"),
    "",
    "────────────────────────────",
    `Order Total: ${ctx.total}`,
    "",
    "We hope you enjoy your new products!",
    "",
    "If you have a moment, we'd love to hear about your experience.",
    "",
    `View Order: ${ctx.orderViewUrl}`,
    `Leave a Review: ${reviewUrl}`,
    "",
    `Thank you for supporting ${ctx.storeName} and the talented makers behind our products.`,
    "",
    `Warm regards,`,
    `The ${ctx.storeName} Team`,
    "",
    `Need help with your order? ${ctx.supportEmail}`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">Hi ${escapeHtml(ctx.customerName)},</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;"><strong>Your order has arrived!</strong></p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#5c4033;">We're happy to let you know that order <strong>${ctx.orderNumber}</strong> has been successfully delivered.</p>
    ${buildSection(
      "Delivery Details",
      `<p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Order Number:</strong> ${escapeHtml(ctx.orderNumber)}</p>
       <p style="margin:0 0 6px;font-size:14px;color:#5c4033;"><strong>Delivered On:</strong> ${escapeHtml(ctx.deliveredDate)}</p>
       <p style="margin:0;font-size:14px;color:#5c4033;"><strong>Delivered To:</strong> ${escapeHtml(ctx.deliveryAddress)}</p>
       <p style="margin:12px 0 0;font-size:14px;color:#5c4033;"><strong>Order Status:</strong> Delivered</p>`
    )}
    ${buildSection(
      "Items",
      `${buildItemsHtml(ctx.products, ctx.currencySymbol, false)}
       <p style="margin:16px 0 0;font-size:14px;color:#5c4033;"><strong>Order Total:</strong> ${escapeHtml(ctx.total)}</p>`
    )}
    <p style="margin:24px 0 8px;font-size:15px;line-height:1.65;color:#5c4033;">We hope you enjoy your new products!</p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:#5c4033;">If you have a moment, we'd love to hear about your experience.</p>
    ${buildButton("View Order", ctx.orderViewUrl)}
    ${buildButton("Leave a Review", reviewUrl)}
    <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#5c4033;text-align:center;">Thank you for supporting ${escapeHtml(ctx.storeName)} and the talented makers behind our products.</p>`;

  const { html } = buildOrderEmailShell({
    subject,
    eyebrow: "Order Delivered",
    heading: "Your order has arrived!",
    bodyHtml,
    ctx,
  });

  return { subject, text, html };
}

module.exports = {
  buildOrderPlacedEmail,
  buildOrderConfirmedEmail,
  buildOrderShippedEmail,
  buildOrderDeliveredEmail,
};
