import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatCurrency,
  formatOrderBillingAddress,
  formatOrderDate,
  getOrderDisplayId,
  normalizeOrder,
} from "./orderUtils";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCaseStatus(value) {
  const text = String(value || "").trim();
  if (!text || text === "—") return "—";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInvoiceData(order) {
  const normalized = normalizeOrder(order);
  const orderId = getOrderDisplayId(normalized);
  const billingAddress = formatOrderBillingAddress(normalized.address, normalized.pincode);

  return {
    storeName: "CraftzLK",
    storeTagline: "Handmade crafts from Sri Lanka",
    orderId,
    date: formatOrderDate(normalized.date),
    customerName: normalized.name || "—",
    phone: normalized.phoneNumber || "—",
    email: normalized.email || "—",
    billingAddress: billingAddress || "—",
    shippingAddress: normalized.shippingAddress || "",
    orderNotes: normalized.orderNotes || "",
    paymentMethod: normalized.paymentMethod || "—",
    paymentId: normalized.paymentId || "—",
    paymentStatus: titleCaseStatus(normalized.paymentStatus),
    orderStatus: titleCaseStatus(normalized.status),
    products: normalized.products || [],
    subtotal: normalized.subtotal,
    discount: normalized.discount,
    tax: normalized.tax,
    shipping: normalized.shipping,
    total: normalized.total,
    fileName: `CraftzLK-Invoice-${String(orderId).replace("#", "")}.pdf`,
  };
}

export function buildInvoiceHtml(order, { autoPrint = false } = {}) {
  const data = getInvoiceData(order);

  const rows = data.products
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.productTitle || "Product")}</td>
        <td>${escapeHtml(item.variant || "—")}</td>
        <td class="num">${escapeHtml(item.quantity ?? 0)}</td>
        <td class="num">${escapeHtml(formatCurrency(item.price))}</td>
        <td class="num">${escapeHtml(formatCurrency(item.subTotal))}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(data.orderId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 36px;
      color: #1f1a14;
      background: #fff;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 13px;
      line-height: 1.45;
    }
    .invoice { max-width: 820px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 2px solid #c9a961;
    }
    .brand-name {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #1f1a14;
    }
    .brand-tag {
      margin: 4px 0 0;
      color: #7a6a58;
      font-size: 12px;
    }
    .invoice-label {
      text-align: right;
    }
    .invoice-label h2 {
      margin: 0;
      font-size: 22px;
      color: #b8860b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .invoice-label p {
      margin: 4px 0 0;
      color: #5c4d3a;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 22px 0;
    }
    .card h3 {
      margin: 0 0 10px;
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #9a8b78;
    }
    .card p {
      margin: 0 0 6px;
      color: #1f1a14;
    }
    .card strong { font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    thead th {
      background: #f7f1e6;
      color: #5c4d3a;
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-align: left;
      padding: 10px 8px;
      border-bottom: 1px solid #e2d4bc;
    }
    tbody td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee6d8;
      vertical-align: top;
    }
    td.num, th.num { text-align: right; white-space: nowrap; }
    .bottom {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 24px;
      margin-top: 22px;
    }
    .meta-list p { margin: 0 0 8px; }
    .meta-list span {
      display: inline-block;
      min-width: 120px;
      color: #9a8b78;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .totals {
      border: 1px solid #e2d4bc;
      border-radius: 10px;
      padding: 14px 16px;
      background: #fffcf7;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 6px 0;
      color: #5c4d3a;
    }
    .totals-row.grand {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 1px solid #c9a961;
      font-size: 15px;
      font-weight: 700;
      color: #1f1a14;
    }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #eee6d8;
      color: #9a8b78;
      font-size: 11px;
      text-align: center;
    }
    @media print {
      body { padding: 16px; }
      .invoice { max-width: none; }
    }
    @page {
      margin: 12mm;
    }
    @media (max-width: 720px) {
      .header, .grid, .bottom { grid-template-columns: 1fr; display: grid; }
      .invoice-label { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1 class="brand-name">${escapeHtml(data.storeName)}</h1>
        <p class="brand-tag">${escapeHtml(data.storeTagline)}</p>
      </div>
      <div class="invoice-label">
        <h2>Invoice</h2>
        <p><strong>${escapeHtml(data.orderId)}</strong></p>
        <p>Date: ${escapeHtml(data.date)}</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Bill To</h3>
        <p><strong>${escapeHtml(data.customerName)}</strong></p>
        <p>${escapeHtml(data.phone)}</p>
        <p>${escapeHtml(data.email)}</p>
        <p>${escapeHtml(data.billingAddress)}</p>
      </div>
      <div class="card">
        <h3>Order Info</h3>
        <p><strong>Order status:</strong> ${escapeHtml(data.orderStatus)}</p>
        <p><strong>Payment status:</strong> ${escapeHtml(data.paymentStatus)}</p>
        <p><strong>Payment method:</strong> ${escapeHtml(data.paymentMethod)}</p>
        <p><strong>Payment ID:</strong> ${escapeHtml(data.paymentId)}</p>
        ${
          data.shippingAddress
            ? `<p><strong>Shipping:</strong> ${escapeHtml(data.shippingAddress)}</p>`
            : ""
        }
        ${
          data.orderNotes
            ? `<p><strong>Notes:</strong> ${escapeHtml(data.orderNotes)}</p>`
            : ""
        }
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Variant</th>
          <th class="num">Qty</th>
          <th class="num">Price</th>
          <th class="num">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows ||
          `<tr><td colspan="5" style="text-align:center;color:#9a8b78;">No items</td></tr>`
        }
      </tbody>
    </table>

    <div class="bottom">
      <div class="meta-list">
        <p><span>Prepared by</span> ${escapeHtml(data.storeName)}</p>
        <p><span>Currency</span> LKR (Rs)</p>
      </div>
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${escapeHtml(formatCurrency(data.subtotal))}</span></div>
        <div class="totals-row"><span>Discount</span><span>- ${escapeHtml(formatCurrency(data.discount))}</span></div>
        <div class="totals-row"><span>Tax</span><span>${escapeHtml(formatCurrency(data.tax))}</span></div>
        <div class="totals-row"><span>Shipping</span><span>${escapeHtml(formatCurrency(data.shipping))}</span></div>
        <div class="totals-row grand"><span>Total</span><span>${escapeHtml(formatCurrency(data.total))}</span></div>
      </div>
    </div>

    <div class="footer">
      Thank you for shopping with ${escapeHtml(data.storeName)}. This invoice was generated for order ${escapeHtml(data.orderId)}.
    </div>
  </div>
  ${autoPrint ? "<script>window.addEventListener('load', () => window.print());</script>" : ""}
</body>
</html>`;
}

export function printOrderInvoice(order) {
  const html = buildInvoiceHtml(order, { autoPrint: false });

  // Print from a blank document so the browser footer does not show the dashboard URL.
  const win = window.open("about:blank", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();

    const triggerPrint = () => {
      try {
        win.focus();
        win.print();
      } finally {
        setTimeout(() => {
          try {
            win.close();
          } catch {
            /* ignore */
          }
        }, 400);
      }
    };

    if (win.document.readyState === "complete") {
      setTimeout(triggerPrint, 100);
    } else {
      win.onload = () => setTimeout(triggerPrint, 100);
    }
    return true;
  }

  // Fallback when pop-ups are blocked: print via a temporary blob iframe.
  const existing = document.getElementById("craftzlk-invoice-print-frame");
  if (existing) existing.remove();

  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.id = "craftzlk-invoice-print-frame";
  iframe.title = "Print invoice";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  const cleanup = () => {
    URL.revokeObjectURL(blobUrl);
    if (iframe.parentNode) iframe.remove();
  };

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(cleanup, 1000);
      }
    }, 50);
  };

  return true;
}

export function downloadOrderPdf(order) {
  const data = getInvoiceData(order);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(31, 26, 20);
  doc.text(data.storeName, margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(122, 106, 88);
  doc.text(data.storeTagline, margin, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(184, 134, 11);
  doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 77, 58);
  doc.text(data.orderId, pageWidth - margin, 26, { align: "right" });
  doc.text(`Date: ${data.date}`, pageWidth - margin, 31, { align: "right" });

  doc.setDrawColor(201, 169, 97);
  doc.setLineWidth(0.6);
  doc.line(margin, 36, pageWidth - margin, 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(154, 139, 120);
  doc.text("BILL TO", margin, 44);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 26, 20);
  doc.text(data.customerName, margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const billLines = [data.phone, data.email, data.billingAddress].filter(Boolean);
  let billY = 55;
  billLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), 90);
    doc.text(wrapped, margin, billY);
    billY += wrapped.length * 5;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(154, 139, 120);
  doc.text("ORDER INFO", pageWidth / 2 + 4, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(31, 26, 20);
  const infoLines = [
    `Order status: ${data.orderStatus}`,
    `Payment status: ${data.paymentStatus}`,
    `Payment method: ${data.paymentMethod}`,
    `Payment ID: ${data.paymentId}`,
  ];
  if (data.shippingAddress) infoLines.push(`Shipping: ${data.shippingAddress}`);
  if (data.orderNotes) infoLines.push(`Notes: ${data.orderNotes}`);

  let infoY = 50;
  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), 88);
    doc.text(wrapped, pageWidth / 2 + 4, infoY);
    infoY += wrapped.length * 5;
  });

  const tableStartY = Math.max(billY, infoY) + 8;

  autoTable(doc, {
    startY: tableStartY,
    head: [["Product", "Variant", "Qty", "Price", "Subtotal"]],
    body: data.products.length
      ? data.products.map((item) => [
          item.productTitle || "Product",
          item.variant || "—",
          String(item.quantity ?? 0),
          formatCurrency(item.price),
          formatCurrency(item.subTotal),
        ])
      : [["No items", "—", "0", formatCurrency(0), formatCurrency(0)]],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [31, 26, 20],
      lineColor: [238, 230, 216],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [247, 241, 230],
      textColor: [92, 77, 58],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const summaryTop = (doc.lastAutoTable?.finalY || tableStartY) + 10;
  const boxX = pageWidth - margin - 78;
  const rows = [
    ["Subtotal", formatCurrency(data.subtotal)],
    ["Discount", `- ${formatCurrency(data.discount)}`],
    ["Tax", formatCurrency(data.tax)],
    ["Shipping", formatCurrency(data.shipping)],
    ["Total", formatCurrency(data.total)],
  ];

  doc.setDrawColor(226, 212, 188);
  doc.setFillColor(255, 252, 247);
  doc.roundedRect(boxX, summaryTop, 78, 50, 2, 2, "FD");

  let y = summaryTop + 8;
  rows.forEach(([label, value], index) => {
    const isTotal = index === rows.length - 1;
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(isTotal ? 11 : 9);
    doc.setTextColor(isTotal ? 31 : 92, isTotal ? 26 : 77, isTotal ? 20 : 58);
    if (isTotal) {
      y += 2;
      doc.setDrawColor(201, 169, 97);
      doc.line(boxX + 4, y, boxX + 74, y);
      y += 7;
    }
    doc.text(label, boxX + 5, y);
    doc.text(value, boxX + 73, y, { align: "right" });
    y += isTotal ? 8 : 7;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(154, 139, 120);
  doc.text(
    `Thank you for shopping with ${data.storeName}. Invoice for order ${data.orderId}.`,
    pageWidth / 2,
    285,
    { align: "center" }
  );

  doc.save(data.fileName);
  return true;
}
