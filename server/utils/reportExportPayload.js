const { getDateRange } = require('../utils/reportDateRange');

function formatMoney(value) {
  const n = Number(value || 0);
  return `Rs ${n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-LK');
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPeriodLabel(query = {}) {
  const preset = query.preset || query.datePreset || 'thisMonth';
  const range = getDateRange(preset, query.customStart || '', query.customEnd || '');
  const start = formatDate(range.start);
  const end = formatDate(range.end);
  const labels = {
    today: 'Today',
    yesterday: 'Yesterday',
    last7days: 'Last 7 days',
    thisWeek: 'This week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    custom: 'Custom range',
  };
  return `${labels[preset] || preset} (${start} – ${end})`;
}

function metric(label, value) {
  return { label, value: value == null ? 'N/A' : String(value) };
}

function buildSalesPayload(data, query) {
  const m = data.metrics || {};
  return {
    title: 'Sales Report',
    subtitle: 'Revenue, profit, and order performance',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Revenue', formatMoney(m.revenue)),
      metric(m.profitLabel || 'Profit', m.profitAvailable ? formatMoney(m.profit) : 'N/A'),
      metric('Paid orders', formatNumber(m.orderCount)),
      metric('Avg order value', formatMoney(m.avgOrderValue)),
      metric('Delivered & paid', formatNumber(m.completedOrderCount)),
    ],
    tables: [
      {
        title: 'Sales trend',
        columns: [
          { key: 'name', label: 'Period', width: 90 },
          { key: 'revenue', label: 'Revenue', width: 90, format: 'money' },
          { key: 'orders', label: 'Orders', width: 70, format: 'number' },
          { key: 'profit', label: m.profitLabel || 'Profit', width: 90, format: 'moneyNullable' },
        ],
        rows: (data.timeSeries || []).map((row) => ({
          name: row.name,
          revenue: row.revenue,
          orders: row.orders,
          profit: row.profitAvailable === false ? null : row.profit,
        })),
      },
      {
        title: 'Top products',
        columns: [
          { key: 'name', label: 'Product', width: 180 },
          { key: 'qty', label: 'Units sold', width: 80, format: 'number' },
          { key: 'revenue', label: 'Revenue', width: 100, format: 'money' },
        ],
        rows: data.topProducts || [],
      },
    ],
  };
}

function buildProductPayload(data, query) {
  const s = data.stats || {};
  return {
    title: 'Product Report',
    subtitle: 'Product performance and stock overview',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total products', formatNumber(s.totalProducts)),
      metric('Total units', formatNumber(s.totalUnits)),
      metric('Low stock', formatNumber(s.lowStock)),
      metric('Out of stock', formatNumber(s.outOfStock)),
    ],
    tables: [
      {
        title: 'Top products',
        columns: [
          { key: 'name', label: 'Product', width: 180 },
          { key: 'qty', label: 'Units sold', width: 80, format: 'number' },
          { key: 'revenue', label: 'Revenue', width: 100, format: 'money' },
        ],
        rows: data.topProducts || [],
      },
      {
        title: 'Low selling products',
        columns: [
          { key: 'name', label: 'Product', width: 180 },
          { key: 'qty', label: 'Units sold', width: 80, format: 'number' },
          { key: 'revenue', label: 'Revenue', width: 100, format: 'money' },
          { key: 'stock', label: 'Stock', width: 70, format: 'number' },
        ],
        rows: data.lowProducts || [],
      },
      {
        title: 'Stock listing',
        columns: [
          { key: 'name', label: 'Product', width: 160 },
          { key: 'category', label: 'Category', width: 110 },
          { key: 'stock', label: 'Stock', width: 60, format: 'number' },
          { key: 'status', label: 'Status', width: 90 },
          { key: 'price', label: 'Price', width: 90, format: 'money' },
        ],
        rows: data.stockReport || [],
      },
    ],
  };
}

function buildCustomerPayload(data, query) {
  const summary = data.customerSummary || {};
  return {
    title: 'Customer Report',
    subtitle: 'Customer growth and spending',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total customers', formatNumber(data.totalCustomers)),
      metric('Customers in period', formatNumber(summary.periodCustomers)),
      metric('Returning rate', formatPercent(summary.returningRate)),
      metric('Avg spend', formatMoney(data.avgSpend)),
    ],
    tables: [
      {
        title: 'Customer growth',
        columns: [
          { key: 'name', label: 'Month', width: 90 },
          { key: 'customers', label: 'Total', width: 80, format: 'number' },
          { key: 'newCustomers', label: 'New', width: 70, format: 'number' },
          { key: 'returning', label: 'Returning', width: 90, format: 'number' },
        ],
        rows: data.growthSeries || [],
      },
      {
        title: 'Top spending customers',
        columns: [
          { key: 'name', label: 'Customer', width: 160 },
          { key: 'orders', label: 'Orders', width: 70, format: 'number' },
          { key: 'spent', label: 'Spent', width: 100, format: 'money' },
        ],
        rows: data.spendingData || [],
      },
    ],
  };
}

function buildPaymentPayload(data, query) {
  const m = data.metrics || {};
  return {
    title: 'Payment / Transaction Report',
    subtitle: 'Paid, pending, failed, and refunded transactions',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total payments', formatNumber(m.totalPayments)),
      metric('Paid amount', formatMoney(m.paidAmount)),
      metric('Pending amount', formatMoney(m.pendingAmount)),
      metric('Failed payments', formatNumber(m.failedCount)),
      metric('Refunded amount', formatMoney(m.refundedAmount)),
      metric('COD payments', formatMoney(m.codAmount)),
      metric('Bank transfer', formatMoney(m.bankTransferAmount)),
    ],
    tables: [
      {
        title: 'Payment method performance',
        columns: [
          { key: 'label', label: 'Method', width: 120 },
          { key: 'count', label: 'Count', width: 60, format: 'number' },
          { key: 'paidAmount', label: 'Paid', width: 90, format: 'money' },
          { key: 'pendingAmount', label: 'Pending', width: 90, format: 'money' },
          { key: 'totalAmount', label: 'Total', width: 90, format: 'money' },
        ],
        rows: data.methodPerformance || [],
      },
      {
        title: 'Transactions',
        columns: [
          { key: 'transactionId', label: 'Transaction', width: 110 },
          { key: 'orderNumber', label: 'Order', width: 80 },
          { key: 'paymentMethod', label: 'Method', width: 100 },
          { key: 'amount', label: 'Amount', width: 90, format: 'money' },
          { key: 'status', label: 'Status', width: 70 },
          { key: 'date', label: 'Date', width: 90, format: 'date' },
        ],
        rows: data.transactions || [],
      },
    ],
  };
}

function buildInventoryPayload(data, query) {
  const m = data.metrics || {};
  return {
    title: 'Inventory / Stock Report',
    subtitle: 'Current stock levels and inventory health',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total products', formatNumber(m.totalProducts)),
      metric('Total units', formatNumber(m.totalUnits)),
      metric('In stock', formatNumber(m.inStock)),
      metric('Low stock', formatNumber(m.lowStock)),
      metric('Out of stock', formatNumber(m.outOfStock)),
      metric('Inventory value', formatMoney(m.inventoryValue)),
    ],
    tables: [
      {
        title: 'Stock by category',
        columns: [
          { key: 'name', label: 'Category', width: 140 },
          { key: 'products', label: 'Products', width: 70, format: 'number' },
          { key: 'units', label: 'Units', width: 70, format: 'number' },
          { key: 'lowStock', label: 'Low', width: 60, format: 'number' },
          { key: 'outOfStock', label: 'Out', width: 60, format: 'number' },
        ],
        rows: data.categoryBreakdown || [],
      },
      {
        title: 'Stock listing',
        columns: [
          { key: 'name', label: 'Product', width: 160 },
          { key: 'category', label: 'Category', width: 110 },
          { key: 'stock', label: 'Stock', width: 60, format: 'number' },
          { key: 'status', label: 'Status', width: 90 },
          { key: 'price', label: 'Price', width: 90, format: 'money' },
        ],
        rows: data.stockReport || [],
      },
    ],
  };
}

function buildCouponPayload(data, query) {
  const m = data.metrics || {};
  return {
    title: 'Coupon Report',
    subtitle: 'Coupon usage and discount performance',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total coupons', formatNumber(m.totalCoupons)),
      metric('Active coupons', formatNumber(m.activeCoupons)),
      metric('Expired coupons', formatNumber(m.expiredCoupons)),
      metric('Orders with coupon', formatNumber(m.ordersWithCoupon)),
      metric('Discount given', formatMoney(m.totalDiscountAmount)),
      metric('Avg discount', formatMoney(m.avgDiscount)),
    ],
    tables: [
      {
        title: 'Coupon usage trend',
        columns: [
          { key: 'name', label: 'Period', width: 90 },
          { key: 'usage', label: 'Usage', width: 70, format: 'number' },
          { key: 'discount', label: 'Discount', width: 100, format: 'money' },
        ],
        rows: data.usageSeries || [],
      },
      {
        title: 'Coupons',
        columns: [
          { key: 'code', label: 'Code', width: 100 },
          { key: 'discountValue', label: 'Discount', width: 80 },
          { key: 'status', label: 'Status', width: 70 },
          { key: 'periodUsageCount', label: 'Period uses', width: 80, format: 'number' },
          { key: 'periodDiscountAmount', label: 'Period discount', width: 100, format: 'money' },
          { key: 'expiryDate', label: 'Expiry', width: 90, format: 'date' },
        ],
        rows: (data.coupons || []).map((row) => ({
          ...row,
          discountValue:
            row.discountType === 'fixed'
              ? formatMoney(row.discountValue)
              : `${Number(row.discountValue || 0)}%`,
        })),
      },
    ],
  };
}

function buildOrderPayload(data, query) {
  const m = data.metrics || {};
  return {
    title: 'Order Report',
    subtitle: 'Orders by status and delivery performance',
    periodLabel: formatPeriodLabel(query),
    metrics: [
      metric('Total orders', formatNumber(m.totalOrders)),
      metric('Delivered & paid', formatNumber(m.deliveredCount)),
      metric('Cancelled', formatNumber(m.cancelledCount)),
      metric('Delivery rate', formatPercent(m.deliveryRate)),
      metric('Cancellation rate', formatPercent(m.cancellationRate)),
      metric('Paid revenue', formatMoney(m.revenue)),
      metric('Avg order value', formatMoney(m.avgOrderValue)),
    ],
    tables: [
      {
        title: 'Orders by status',
        columns: [
          { key: 'name', label: 'Status', width: 100 },
          { key: 'value', label: 'Count', width: 70, format: 'number' },
          { key: 'amount', label: 'Amount', width: 100, format: 'money' },
        ],
        rows: data.statusBreakdown || [],
      },
      {
        title: 'Orders in period',
        columns: [
          { key: 'orderNumber', label: 'Order', width: 90 },
          { key: 'customer', label: 'Customer', width: 120 },
          { key: 'amount', label: 'Amount', width: 90, format: 'money' },
          { key: 'status', label: 'Status', width: 80 },
          { key: 'paymentStatus', label: 'Payment', width: 70 },
          { key: 'paymentMethod', label: 'Method', width: 90 },
          { key: 'date', label: 'Date', width: 90, format: 'date' },
        ],
        rows: data.recentOrders || [],
      },
    ],
  };
}

const BUILDERS = {
  sales: buildSalesPayload,
  products: buildProductPayload,
  customers: buildCustomerPayload,
  payments: buildPaymentPayload,
  inventory: buildInventoryPayload,
  coupons: buildCouponPayload,
  orders: buildOrderPayload,
};

function formatCellValue(value, format) {
  if (format === 'moneyNullable') {
    return value == null || value === '' ? 'N/A' : formatMoney(value);
  }
  if (value == null || value === '') return '—';
  if (format === 'money') return formatMoney(value);
  if (format === 'number') return formatNumber(value);
  if (format === 'date') return formatDate(value);
  if (format === 'percent') return formatPercent(value);
  return String(value);
}

function buildExportPayload(type, data, query) {
  const builder = BUILDERS[type];
  if (!builder) {
    const error = new Error('Unsupported report type.');
    error.statusCode = 400;
    error.payload = { success: false, message: error.message };
    throw error;
  }
  return builder(data, query);
}

module.exports = {
  BUILDERS,
  buildExportPayload,
  formatCellValue,
  formatMoney,
  formatPeriodLabel,
};
