const {
  escapeHtml,
  getPasswordResetLogoAttachment,
  LOGO_CID,
} = require("./passwordResetEmail");

function formatMoney(amount, symbol = "Rs") {
  const value = Number(amount) || 0;
  return `${symbol} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPaymentMethod(method) {
  const map = {
    cod: "Cash on Delivery",
    card: "Card Payment",
    bank_transfer: "Bank Transfer",
    stripe: "Card Payment",
  };
  return map[String(method || "").toLowerCase()] || method || "—";
}

function formatPaymentStatus(status) {
  const map = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  };
  return map[String(status || "").toLowerCase()] || status || "—";
}

function formatOrderStatus(status) {
  if (!status) return "—";
  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
}

function buildItemsText(products = [], symbol = "Rs") {
  return (products || [])
    .map((item) => {
      const title = item.productTitle || "Product";
      const qty = Number(item.quantity) || 1;
      const price = formatMoney(item.subTotal ?? item.price * qty, symbol);
      return `${title} × ${qty}\n${price}`;
    })
    .join("\n\n");
}

function buildItemsHtml(products = [], symbol = "Rs", includePrice = true) {
  if (!products?.length) {
    return `<p style="margin:0;font-size:14px;color:#5c4033;">No items listed.</p>`;
  }

  return products
    .map((item) => {
      const title = escapeHtml(item.productTitle || "Product");
      const qty = Number(item.quantity) || 1;
      const price = formatMoney(item.subTotal ?? item.price * qty, symbol);
      return `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#5c4033;">
        <strong>${title}</strong> × ${qty}${includePrice ? `<br /><span style="color:#8b7355;">${escapeHtml(price)}</span>` : ""}
      </p>`;
    })
    .join("");
}

function buildTotalsBlock(ctx) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5c4033;">
      <tr><td style="padding:4px 0;">Subtotal:</td><td style="padding:4px 0;text-align:right;">${escapeHtml(ctx.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;">Delivery:</td><td style="padding:4px 0;text-align:right;">${escapeHtml(ctx.deliveryCharge)}</td></tr>
      <tr><td style="padding:4px 0;">Discount:</td><td style="padding:4px 0;text-align:right;">-${escapeHtml(String(ctx.discount).replace(/^Rs\.?\s?/, ""))}</td></tr>
      <tr><td style="padding:4px 0;">Tax:</td><td style="padding:4px 0;text-align:right;">${escapeHtml(ctx.tax)}</td></tr>
      <tr><td style="padding:8px 0 4px;font-weight:700;color:#3d2817;">Total:</td><td style="padding:8px 0 4px;text-align:right;font-weight:700;color:#3d2817;">${escapeHtml(ctx.total)}</td></tr>
    </table>`;
}

function buildSection(title, innerHtml) {
  return `
    <div style="margin:24px 0 0;">
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#b8860b;">${escapeHtml(title)}</p>
      <div style="border-top:1px solid rgba(201,169,97,0.35);padding-top:12px;">
        ${innerHtml}
      </div>
    </div>`;
}

function buildButton(label, href) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background-color:#b8860b;">
          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${safeLabel}</a>
        </td>
      </tr>
    </table>`;
}

function buildOrderEmailShell({ subject, eyebrow, heading, bodyHtml, ctx, secondaryButton }) {
  const siteUrl = escapeHtml((ctx.frontendUrl || "https://craftzlk.com").replace(/\/$/, ""));
  const logoSrc = `cid:${LOGO_CID}`;
  const year = new Date().getFullYear();
  const secondaryBtnHtml = secondaryButton
    ? buildButton(secondaryButton.label, secondaryButton.href)
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1e8;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f1e8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${logoSrc}" alt="${escapeHtml(ctx.storeName)}" width="120" style="display:block;border:0;max-width:120px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(61,40,23,0.08);border:1px solid rgba(201,169,97,0.25);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="height:6px;background:linear-gradient(90deg,#c9a961,#b8860b,#d4a574);font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:32px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#b8860b;">${escapeHtml(eyebrow)}</p>
                    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#3d2817;">${escapeHtml(heading)}</h1>
                    ${bodyHtml}
                    ${secondaryBtnHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 12px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#3d2817;">Crafted with heart</p>
              <p style="margin:0 0 12px;font-size:13px;color:#8b7355;">
                Warm regards,<br />The ${escapeHtml(ctx.storeName)} Team
              </p>
              <p style="margin:0;font-size:12px;color:#a8957a;">
                Need help? Contact us at <a href="mailto:${escapeHtml(ctx.supportEmail)}" style="color:#b8860b;">${escapeHtml(ctx.supportEmail)}</a><br />
                &copy; ${year} ${escapeHtml(ctx.storeName)}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html };
}

module.exports = {
  LOGO_CID,
  escapeHtml,
  getPasswordResetLogoAttachment,
  formatMoney,
  formatDate,
  formatPaymentMethod,
  formatPaymentStatus,
  formatOrderStatus,
  buildItemsText,
  buildItemsHtml,
  buildTotalsBlock,
  buildSection,
  buildButton,
  buildOrderEmailShell,
};
