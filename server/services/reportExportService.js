const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const reportsService = require('./reportsService');
const { buildExportPayload, formatCellValue } = require('../utils/reportExportPayload');

const REPORT_FETCHERS = {
  sales: (query, user) => reportsService.getSalesReport(query, user),
  products: (query, user) => reportsService.getProductReport(query, user),
  customers: (query, user) => reportsService.getCustomerReport(query, user),
  payments: (query, user) => reportsService.getPaymentReport(query, user),
  inventory: (query, user) => reportsService.getInventoryReport(query, user),
  coupons: (query, user) => reportsService.getCouponReport(query, user),
  orders: (query, user) => reportsService.getOrderReport(query, user),
};

const COLORS = {
  ink: '#1f1a14',
  muted: '#6b5d4d',
  gold: '#b8860b',
  goldSoft: '#c9a961',
  line: '#e4d7c3',
  headerBg: '#2a241c',
  headerText: '#fff8ec',
  rowAlt: '#faf6ef',
  white: '#ffffff',
};

function assertAdmin(authUser) {
  if (authUser?.role !== 'admin') {
    const error = new Error('Login again to access this page.');
    error.statusCode = 401;
    error.payload = { success: false, message: error.message };
    throw error;
  }
}

function slugify(value) {
  return String(value || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function loadPayload(type, query, authUser) {
  assertAdmin(authUser);
  const fetcher = REPORT_FETCHERS[type];
  if (!fetcher) {
    const error = new Error('Unsupported report type.');
    error.statusCode = 400;
    error.payload = { success: false, message: error.message };
    throw error;
  }
  const data = await fetcher(query, authUser);
  return buildExportPayload(type, data, query);
}

function drawPdfHeader(doc, payload, pageWidth, margin) {
  const contentWidth = pageWidth - margin * 2;

  doc.rect(0, 0, pageWidth, 8).fill(COLORS.gold);
  doc.rect(margin, 24, contentWidth, 54).fill(COLORS.headerBg);

  doc
    .fillColor(COLORS.goldSoft)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('CRAFTZLK ADMIN', margin + 16, 34, { width: contentWidth - 32 });

  doc
    .fillColor(COLORS.headerText)
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(payload.title, margin + 16, 48, { width: contentWidth - 32 });

  doc
    .fillColor('#d4c4b0')
    .font('Helvetica')
    .fontSize(9)
    .text(payload.subtitle || '', margin + 16, 68, { width: contentWidth - 32 });

  return 96;
}

function drawPdfMeta(doc, payload, y, margin, contentWidth) {
  const generatedAt = new Date().toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(9)
    .text(`Period: ${payload.periodLabel}`, margin, y, { width: contentWidth / 2, continued: false });

  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(9)
    .text(`Generated: ${generatedAt}`, margin, y, {
      width: contentWidth,
      align: 'right',
    });

  doc
    .moveTo(margin, y + 16)
    .lineTo(margin + contentWidth, y + 16)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();

  return y + 28;
}

function drawPdfMetrics(doc, metrics, startY, margin, contentWidth) {
  if (!metrics?.length) return startY;

  let y = startY;
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Key metrics', margin, y);
  y += 18;

  const gap = 10;
  const cardWidth = (contentWidth - gap) / 2;
  const cardHeight = 42;

  metrics.forEach((item, index) => {
    const col = index % 2;
    if (col === 0 && index > 0) y += cardHeight + gap;
    if (y + cardHeight > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }

    const x = margin + col * (cardWidth + gap);
    doc.roundedRect(x, y, cardWidth, cardHeight, 6).fillAndStroke(COLORS.rowAlt, COLORS.line);
    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(item.label.toUpperCase(), x + 10, y + 8, { width: cardWidth - 20 });
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(item.value, x + 10, y + 22, { width: cardWidth - 20 });
  });

  if (metrics.length) {
    y += cardHeight + 18;
  }
  return y;
}

function ensurePdfSpace(doc, y, needed) {
  if (y + needed > doc.page.height - 50) {
    doc.addPage();
    return 40;
  }
  return y;
}

function drawPdfTable(doc, table, startY, margin, contentWidth) {
  let y = startY;
  const columns = table.columns || [];
  const rows = table.rows || [];
  if (!columns.length) return y;

  y = ensurePdfSpace(doc, y, 60);
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(table.title, margin, y);
  y += 16;

  const totalWeight = columns.reduce((sum, col) => sum + (col.width || 80), 0);
  const colWidths = columns.map((col) => ((col.width || 80) / totalWeight) * contentWidth);
  const rowHeight = 18;

  const drawHeader = () => {
    doc.rect(margin, y, contentWidth, rowHeight).fill(COLORS.headerBg);
    let x = margin;
    columns.forEach((col, index) => {
      doc
        .fillColor(COLORS.headerText)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(col.label, x + 4, y + 5, {
          width: colWidths[index] - 8,
          ellipsis: true,
        });
      x += colWidths[index];
    });
    y += rowHeight;
  };

  drawHeader();

  if (!rows.length) {
    y = ensurePdfSpace(doc, y, 24);
    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(9)
      .text('No details available for this section.', margin + 4, y + 4);
    return y + 24;
  }

  rows.forEach((row, rowIndex) => {
    y = ensurePdfSpace(doc, y, rowHeight + 4);
    if (y === 40) drawHeader();

    if (rowIndex % 2 === 1) {
      doc.rect(margin, y, contentWidth, rowHeight).fill(COLORS.rowAlt);
    }

    let x = margin;
    columns.forEach((col, index) => {
      const text = formatCellValue(row[col.key], col.format);
      doc
        .fillColor(COLORS.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(text, x + 4, y + 5, {
          width: colWidths[index] - 8,
          ellipsis: true,
        });
      x += colWidths[index];
    });
    y += rowHeight;
  });

  return y + 14;
}

function drawPdfFooter(doc, pageWidth) {
  const range = doc.bufferedPageRange();
  const pageCount = range.count;

  for (let i = 0; i < pageCount; i += 1) {
    doc.switchToPage(range.start + i);

    // Footer sits in the bottom margin; PDFKit auto-paginates text that
    // crosses the bottom margin, which created empty trailing pages.
    const savedMargins = { ...doc.page.margins };
    doc.page.margins = { top: 0, left: 0, right: 0, bottom: 0 };

    const footerY = doc.page.height - 28;
    doc
      .moveTo(40, footerY - 8)
      .lineTo(pageWidth - 40, footerY - 8)
      .strokeColor(COLORS.line)
      .lineWidth(1)
      .stroke();

    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(8)
      .text('CraftzLK · Confidential admin report', 40, footerY, {
        width: pageWidth / 2 - 50,
        align: 'left',
        lineBreak: false,
      });

    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(`Page ${i + 1} of ${pageCount}`, pageWidth / 2, footerY, {
        width: pageWidth / 2 - 40,
        align: 'right',
        lineBreak: false,
      });

    doc.page.margins = savedMargins;
  }
}

function generatePdfBuffer(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: {
        Title: payload.title,
        Author: 'CraftzLK Admin',
        Subject: payload.subtitle || payload.title,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    let y = drawPdfHeader(doc, payload, pageWidth, margin);
    y = drawPdfMeta(doc, payload, y, margin, contentWidth);
    y = drawPdfMetrics(doc, payload.metrics, y, margin, contentWidth);

    (payload.tables || []).forEach((table) => {
      y = drawPdfTable(doc, table, y, margin, contentWidth);
    });

    drawPdfFooter(doc, pageWidth);
    doc.end();
  });
}

async function generateExcelBuffer(payload) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CraftzLK Admin';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary', {
    properties: { defaultRowHeight: 18 },
  });

  summary.mergeCells('A1:B1');
  summary.getCell('A1').value = payload.title;
  summary.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF1F1A14' } };

  summary.mergeCells('A2:B2');
  summary.getCell('A2').value = payload.subtitle || '';
  summary.getCell('A2').font = { size: 11, color: { argb: 'FF6B5D4D' } };

  summary.getCell('A4').value = 'Period';
  summary.getCell('B4').value = payload.periodLabel;
  summary.getCell('A5').value = 'Generated';
  summary.getCell('B5').value = new Date().toLocaleString('en-LK');

  summary.getCell('A7').value = 'Metric';
  summary.getCell('B7').value = 'Value';
  summary.getRow(7).font = { bold: true, color: { argb: 'FFFFF8EC' } };
  summary.getRow(7).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2A241C' },
  };

  (payload.metrics || []).forEach((item, index) => {
    const row = summary.getRow(8 + index);
    row.getCell(1).value = item.label;
    row.getCell(2).value = item.value;
    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFAF6EF' },
      };
    }
  });

  summary.getColumn(1).width = 28;
  summary.getColumn(2).width = 36;

  (payload.tables || []).forEach((table, tableIndex) => {
    const sheetName = String(table.title || `Sheet ${tableIndex + 1}`)
      .replace(/[\\/*?:\[\]]/g, ' ')
      .slice(0, 28);
    const sheet = workbook.addWorksheet(sheetName || `Data ${tableIndex + 1}`);
    const columns = table.columns || [];

    sheet.columns = columns.map((col) => ({
      header: col.label,
      key: col.key,
      width: Math.max(12, Math.round((col.width || 80) / 7)),
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFF8EC' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2A241C' },
    };
    headerRow.alignment = { vertical: 'middle' };

    (table.rows || []).forEach((row, rowIndex) => {
      const values = {};
      columns.forEach((col) => {
        values[col.key] = formatCellValue(row[col.key], col.format);
      });
      const excelRow = sheet.addRow(values);
      if (rowIndex % 2 === 1) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFAF6EF' },
        };
      }
    });

    if (!(table.rows || []).length) {
      sheet.addRow({ [columns[0]?.key || 'name']: 'No details available' });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

class ReportExportService {
  async export(type, format, query, authUser) {
    const payload = await loadPayload(type, query, authUser);
    const safeName = slugify(payload.title);
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'xlsx' || format === 'excel') {
      const buffer = await generateExcelBuffer(payload);
      return {
        buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${safeName}-${stamp}.xlsx`,
      };
    }

    if (format === 'pdf') {
      const buffer = await generatePdfBuffer(payload);
      return {
        buffer,
        contentType: 'application/pdf',
        filename: `${safeName}-${stamp}.pdf`,
      };
    }

    const error = new Error('Unsupported export format. Use pdf or xlsx.');
    error.statusCode = 400;
    error.payload = { success: false, message: error.message };
    throw error;
  }
}

module.exports = new ReportExportService();
