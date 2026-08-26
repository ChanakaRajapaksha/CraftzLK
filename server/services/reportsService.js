const { Orders } = require('../models/orders');
const { Product } = require('../models/products');
const { ShippingMethod } = require('../models/shippingMethod');
const { Customers } = require('../models/customers');
const { Coupon } = require('../models/coupon');
const {
  getDateRange,
  filterOrdersInRange,
  parseOrderDate,
  parseAmount,
} = require('../utils/reportDateRange');
const { aggregateOrdersProfit } = require('../utils/reportProfit');
const {
  filterRevenueEligibleOrders,
  sumOrderRevenue,
  countCompletedOrders,
  isRevenueEligibleOrder,
  isPaidPayment,
  isPendingPayment,
  isFailedPayment,
  isRefundedPayment,
  isCancelledOrder,
  isCompletedOrder,
  normalizePaymentStatus,
  normalizeOrderStatus,
} = require('../utils/orderFinancialRules');

function assertAdmin(authUser) {
  if (authUser?.role !== 'admin') {
    const error = new Error('Login again to access this page.');
    error.statusCode = 401;
    error.payload = { success: false, message: error.message };
    throw error;
  }
}

function parseReportQuery(query = {}) {
  return {
    preset: query.preset || query.datePreset || 'thisMonth',
    customStart: query.customStart || '',
    customEnd: query.customEnd || '',
    categoryId: query.categoryId || 'all',
    productId: query.productId || 'all',
  };
}

async function loadReportContext() {
  const [orders, products, shippingMethods, totalCustomers] = await Promise.all([
    Orders.find().sort({ date: -1 }).lean(),
    Product.find().lean(),
    ShippingMethod.find().lean(),
    Customers.countDocuments(),
  ]);

  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  const shippingMethodById = new Map(
    shippingMethods.map((method) => [String(method._id), method])
  );

  const shippingMethodByCost = new Map();
  shippingMethods.forEach((method) => {
    shippingMethodByCost.set(Number(method.cost) || 0, method);
  });

  const categoryNameById = new Map();
  products.forEach((product) => {
    if (product.catId) {
      categoryNameById.set(String(product.catId), product.catName || '');
    }
    if (product.category) {
      categoryNameById.set(String(product.category), product.catName || '');
    }
  });

  return {
    orders,
    products,
    productMap,
    shippingMethodById,
    shippingMethodByCost,
    categoryNameById,
    totalCustomers,
  };
}

function filterOrdersByCategory(orders, categoryId, categoryNameById, productMap) {
  if (!categoryId || categoryId === 'all') return orders;
  const categoryName = categoryNameById.get(String(categoryId));

  return orders.filter((order) =>
    (order.products || []).some((item) => {
      const product = productMap.get(String(item.productId || ''));
      if (!product) return false;
      return (
        String(product.catId) === String(categoryId) ||
        String(product.category) === String(categoryId) ||
        (categoryName && product.catName === categoryName)
      );
    })
  );
}

function filterOrdersByProduct(orders, productId, productMap) {
  if (!productId || productId === 'all') return orders;
  const product = productMap.get(String(productId));
  const productName = product?.name;

  return orders.filter((order) =>
    (order.products || []).some(
      (item) =>
        String(item.productId) === String(productId) ||
        (productName && item.productTitle === productName)
    )
  );
}

function applyReportFilters(orders, filters, context) {
  const range = getDateRange(filters.preset, filters.customStart, filters.customEnd);
  let list = filterOrdersInRange(orders, range.start, range.end);
  list = filterOrdersByCategory(list, filters.categoryId, context.categoryNameById, context.productMap);
  list = filterOrdersByProduct(list, filters.productId, context.productMap);
  return { list, range };
}

function filterProducts(products, categoryId, productId, categoryNameById) {
  let list = [...products];

  if (categoryId && categoryId !== 'all') {
    const categoryName = categoryNameById.get(String(categoryId));
    list = list.filter(
      (product) =>
        String(product.catId) === String(categoryId) ||
        String(product.category) === String(categoryId) ||
        (categoryName && product.catName === categoryName)
    );
  }

  if (productId && productId !== 'all') {
    list = list.filter((product) => String(product._id) === String(productId));
  }

  return list;
}

function bucketCount(start, end) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  if (days <= 14) return days;
  if (days <= 90) return Math.min(12, Math.ceil(days / 7));
  return Math.min(12, Math.ceil(days / 30));
}

function buildSalesTimeSeries(orders, start, end, metric, context) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const useDaily = days <= 14;
  const buckets = bucketCount(start, end);

  return Array.from({ length: buckets }, (_, index) => {
    const bucketStart = new Date(start);
    if (useDaily) {
      bucketStart.setDate(bucketStart.getDate() + index);
    } else if (days <= 90) {
      bucketStart.setDate(bucketStart.getDate() + index * 7);
    } else {
      bucketStart.setMonth(bucketStart.getMonth() + index);
    }

    const bucketEnd = new Date(bucketStart);
    if (useDaily) {
      bucketEnd.setHours(23, 59, 59, 999);
    } else if (days <= 90) {
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);
    } else {
      bucketEnd.setMonth(bucketEnd.getMonth() + 1, 0);
      bucketEnd.setHours(23, 59, 59, 999);
    }

    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const slice = filterOrdersInRange(orders, bucketStart, bucketEnd);
    const financialSlice = filterRevenueEligibleOrders(slice);
    const revenue = sumOrderRevenue(financialSlice);
    const ordersCount = financialSlice.length;
    const sliceProfit = aggregateOrdersProfit(
      financialSlice,
      context.productMap,
      context.shippingMethodById,
      context.shippingMethodByCost
    );

    const name = useDaily
      ? bucketStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
      : days <= 90
        ? `Wk ${index + 1}`
        : bucketStart.toLocaleDateString('en-LK', { month: 'short' });

    return {
      name,
      revenue,
      profit: sliceProfit.profit,
      profitAvailable: sliceProfit.profitAvailable,
      orders: ordersCount,
      value:
        metric === 'orders'
          ? ordersCount
          : metric === 'profit'
            ? sliceProfit.profit ?? 0
            : revenue,
    };
  });
}

function buildTopProducts(orders, products, limit, start, end) {
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const qtyMap = new Map();

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const id = item.productId || item.productTitle;
      if (!id) return;
      const prev = qtyMap.get(String(id)) || {
        name: item.productTitle || 'Product',
        qty: 0,
        revenue: 0,
      };
      prev.qty += Number(item.quantity || 1);
      prev.revenue += parseAmount(item.subTotal || item.price * (item.quantity || 1));
      qtyMap.set(String(id), prev);
    });
  });

  const productById = new Map();
  products.forEach((product) => {
    productById.set(String(product._id), product);
    if (product.name) productById.set(product.name, product);
  });

  return [...qtyMap.entries()]
    .map(([id, data]) => {
      const product = productById.get(id);
      return {
        id,
        name: product?.name || data.name,
        image: product?.images?.[0] || '',
        qty: data.qty,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

function buildLowSellingProducts(orders, products, limit, start, end) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 15);
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const qtyMap = new Map();

  products.forEach((product) => {
    const id = String(product._id);
    qtyMap.set(id, {
      id,
      name: product.name || 'Product',
      qty: 0,
      revenue: 0,
      stock: Number(product.countInStock ?? 0),
    });
  });

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const id = String(item.productId || '');
      if (!id || !qtyMap.has(id)) return;
      const entry = qtyMap.get(id);
      entry.qty += Number(item.quantity || 1);
      entry.revenue += parseAmount(item.subTotal || item.price * (item.quantity || 1));
    });
  });

  const ranked = [...qtyMap.values()].sort(
    (a, b) =>
      a.qty - b.qty ||
      a.revenue - b.revenue ||
      String(a.name).localeCompare(String(b.name))
  );

  return {
    items: ranked.slice(0, safeLimit),
    totalCount: ranked.length,
  };
}

function buildStockReport(products) {
  return products
    .map((product) => {
      const stock = Number(product.countInStock ?? 0);
      const minAlert = Number(product.minStockAlert ?? 5);
      let status = 'in_stock';
      if (stock <= 0) status = 'out_of_stock';
      else if (stock <= minAlert) status = 'low_stock';

      return {
        id: String(product._id),
        name: product.name || 'Product',
        category: product.catName || '—',
        stock,
        status,
        price: parseAmount(product.price),
      };
    })
    .sort((a, b) => a.stock - b.stock);
}

function buildCustomerSpending(orders, limit, start, end) {
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const spendingMap = new Map();

  orderList.forEach((order) => {
    const key = order.userid || order.userId || order.email;
    if (!key) return;
    const label = order.name || order.email || 'Customer';
    const prev = spendingMap.get(String(key)) || { name: label, orders: 0, spent: 0 };
    prev.orders += 1;
    prev.spent += parseAmount(order.amount);
    spendingMap.set(String(key), prev);
  });

  return [...spendingMap.values()]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit)
    .map((item) => ({
      name: item.name.length > 18 ? `${item.name.slice(0, 16)}…` : item.name,
      spent: item.spent,
      orders: item.orders,
    }));
}

function buildCustomerGrowthSeries(orders) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthOrders = filterRevenueEligibleOrders(
      filterOrdersInRange(orders, monthDate, monthEnd)
    );
    const unique = new Set(
      monthOrders.map((order) => order.userid || order.userId || order.email).filter(Boolean)
    );
    const newCustomers = unique.size;
    const returning = [...unique].filter((key) => {
      const prior = orders.filter((order) => {
        if (!isRevenueEligibleOrder(order)) return false;
        const orderKey = order.userid || order.userId || order.email;
        if (String(orderKey) !== String(key)) return false;
        const date = parseOrderDate(order);
        return date && date < monthDate;
      });
      return prior.length > 0;
    }).length;

    return {
      name: monthDate.toLocaleDateString('en-LK', { month: 'short' }),
      customers: newCustomers,
      returning,
      newCustomers: Math.max(0, newCustomers - returning),
    };
  });
}

function computeCustomerSummary(orders, totalCustomers, start, end) {
  const rangeOrders = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const customerOrders = new Map();

  rangeOrders.forEach((order) => {
    const key = order.userid || order.userId || order.email;
    if (!key) return;
    const d = parseOrderDate(order);
    if (!customerOrders.has(String(key))) customerOrders.set(String(key), []);
    if (d) customerOrders.get(String(key)).push(d);
  });

  let returningCustomers = 0;
  customerOrders.forEach((dates) => {
    dates.sort((a, b) => a - b);
    if (dates.length > 1) returningCustomers += 1;
  });

  const totalInPeriod = customerOrders.size;
  const returningRate = totalInPeriod ? (returningCustomers / totalInPeriod) * 100 : 0;

  return {
    totalCustomers,
    returningCustomers,
    returningRate,
    periodCustomers: totalInPeriod,
  };
}

function normalizePaymentMethod(value) {
  const method = String(value || '').toLowerCase().trim();
  if (!method) return 'other';
  if (method === 'cod' || method.includes('cash')) return 'cod';
  if (method.includes('bank') || method.includes('transfer') || method.includes('deposit')) {
    return 'bank_transfer';
  }
  return method;
}

function formatPaymentMethodLabel(method) {
  if (method === 'cod') return 'COD';
  if (method === 'bank_transfer') return 'Bank Transfer';
  if (!method || method === 'other') return 'Other';
  return method
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPaymentStatusLabel(status) {
  const value = normalizePaymentStatus({ paymentStatus: status });
  if (!value) return 'Pending';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildPaymentTimeSeries(orders, start, end) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const useDaily = days <= 14;
  const buckets = bucketCount(start, end);

  return Array.from({ length: buckets }, (_, index) => {
    const bucketStart = new Date(start);
    if (useDaily) {
      bucketStart.setDate(bucketStart.getDate() + index);
    } else if (days <= 90) {
      bucketStart.setDate(bucketStart.getDate() + index * 7);
    } else {
      bucketStart.setMonth(bucketStart.getMonth() + index);
    }

    const bucketEnd = new Date(bucketStart);
    if (useDaily) {
      bucketEnd.setHours(23, 59, 59, 999);
    } else if (days <= 90) {
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);
    } else {
      bucketEnd.setMonth(bucketEnd.getMonth() + 1, 0);
      bucketEnd.setHours(23, 59, 59, 999);
    }
    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const slice = filterOrdersInRange(orders, bucketStart, bucketEnd);
    const paid = slice.filter(isPaidPayment);
    const pending = slice.filter(isPendingPayment);
    const failed = slice.filter(isFailedPayment);
    const refunded = slice.filter(isRefundedPayment);

    const name = useDaily
      ? bucketStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
      : days <= 90
        ? `Wk ${index + 1}`
        : bucketStart.toLocaleDateString('en-LK', { month: 'short' });

    return {
      name,
      paid: paid.reduce((sum, order) => sum + parseAmount(order.amount), 0),
      pending: pending.reduce((sum, order) => sum + parseAmount(order.amount), 0),
      failed: failed.reduce((sum, order) => sum + parseAmount(order.amount), 0),
      refunded: refunded.reduce((sum, order) => sum + parseAmount(order.amount), 0),
      transactions: slice.length,
    };
  });
}

function buildPaymentMethodPerformance(orders) {
  const map = new Map();

  orders.forEach((order) => {
    const key = normalizePaymentMethod(order.paymentMethod);
    const prev = map.get(key) || {
      method: key,
      label: formatPaymentMethodLabel(key),
      count: 0,
      paidAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      refundedAmount: 0,
      totalAmount: 0,
    };

    const amount = parseAmount(order.amount);
    prev.count += 1;
    prev.totalAmount += amount;
    if (isPaidPayment(order)) prev.paidAmount += amount;
    else if (isPendingPayment(order)) prev.pendingAmount += amount;
    else if (isFailedPayment(order)) prev.failedAmount += amount;
    else if (isRefundedPayment(order)) prev.refundedAmount += amount;
    map.set(key, prev);
  });

  return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount);
}

function buildPaymentTransactions(orders, limit = 50) {
  return [...orders]
    .sort((a, b) => {
      const dateA = parseOrderDate(a)?.getTime() || 0;
      const dateB = parseOrderDate(b)?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, limit)
    .map((order) => {
      const orderNumber = order.orderNumber || order.paymentId || String(order._id || '');
      const txnId = order.paymentId || order.orderNumber || `TXN-${String(order._id || '').slice(-6)}`;
      return {
        id: String(order._id || txnId),
        transactionId: txnId,
        orderNumber: orderNumber ? (String(orderNumber).startsWith('#') ? orderNumber : `#${orderNumber}`) : '—',
        paymentMethod: formatPaymentMethodLabel(normalizePaymentMethod(order.paymentMethod)),
        paymentMethodKey: normalizePaymentMethod(order.paymentMethod),
        amount: parseAmount(order.amount),
        status: formatPaymentStatusLabel(order.paymentStatus),
        statusKey: normalizePaymentStatus(order),
        customer: order.name || order.email || '—',
        date: parseOrderDate(order)?.toISOString() || null,
      };
    });
}

function buildPaymentStatusChart(metrics) {
  return [
    { name: 'Paid', value: metrics.paidCount, amount: metrics.paidAmount, fill: '#6b8f71' },
    { name: 'Pending', value: metrics.pendingCount, amount: metrics.pendingAmount, fill: '#d4a574' },
    { name: 'Failed', value: metrics.failedCount, amount: metrics.failedAmount, fill: '#c45c5c' },
    { name: 'Refunded', value: metrics.refundedCount, amount: metrics.refundedAmount, fill: '#9a8b78' },
  ].filter((entry) => entry.value > 0 || entry.amount > 0);
}

function buildOrderStatusBreakdown(orders) {
  const map = new Map();
  orders.forEach((order) => {
    const status = normalizeOrderStatus(order) || 'placed';
    const prev = map.get(status) || { status, count: 0, amount: 0 };
    prev.count += 1;
    prev.amount += parseAmount(order.amount);
    map.set(status, prev);
  });

  const fills = {
    placed: '#d4a574',
    confirmed: '#c9a961',
    packed: '#b8860b',
    shipped: '#8b6f47',
    delivered: '#6b8f71',
    cancelled: '#c45c5c',
    returned: '#9a8b78',
  };

  return [...map.values()]
    .map((entry) => ({
      name: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
      status: entry.status,
      value: entry.count,
      amount: entry.amount,
      fill: fills[entry.status] || '#b8860b',
    }))
    .sort((a, b) => b.value - a.value);
}

function buildOrderTimeSeries(orders, start, end) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const useDaily = days <= 14;
  const buckets = bucketCount(start, end);

  return Array.from({ length: buckets }, (_, index) => {
    const bucketStart = new Date(start);
    if (useDaily) bucketStart.setDate(bucketStart.getDate() + index);
    else if (days <= 90) bucketStart.setDate(bucketStart.getDate() + index * 7);
    else bucketStart.setMonth(bucketStart.getMonth() + index);

    const bucketEnd = new Date(bucketStart);
    if (useDaily) bucketEnd.setHours(23, 59, 59, 999);
    else if (days <= 90) {
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);
    } else {
      bucketEnd.setMonth(bucketEnd.getMonth() + 1, 0);
      bucketEnd.setHours(23, 59, 59, 999);
    }
    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const slice = filterOrdersInRange(orders, bucketStart, bucketEnd);
    const name = useDaily
      ? bucketStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
      : days <= 90
        ? `Wk ${index + 1}`
        : bucketStart.toLocaleDateString('en-LK', { month: 'short' });

    return {
      name,
      orders: slice.length,
      delivered: slice.filter(isCompletedOrder).length,
      cancelled: slice.filter(isCancelledOrder).length,
    };
  });
}

function buildRecentOrdersTable(orders, limit = 40) {
  return [...orders]
    .sort((a, b) => {
      const dateA = parseOrderDate(a)?.getTime() || 0;
      const dateB = parseOrderDate(b)?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, limit)
    .map((order) => {
      const orderNumber = order.orderNumber || order.paymentId || String(order._id || '');
      return {
        id: String(order._id || orderNumber),
        orderNumber: orderNumber ? (String(orderNumber).startsWith('#') ? orderNumber : `#${orderNumber}`) : '—',
        customer: order.name || order.email || '—',
        amount: parseAmount(order.amount),
        status: (normalizeOrderStatus(order) || 'placed').replace(/^\w/, (c) => c.toUpperCase()),
        statusKey: normalizeOrderStatus(order) || 'placed',
        paymentStatus: formatPaymentStatusLabel(order.paymentStatus),
        paymentStatusKey: normalizePaymentStatus(order),
        paymentMethod: formatPaymentMethodLabel(normalizePaymentMethod(order.paymentMethod)),
        date: parseOrderDate(order)?.toISOString() || null,
      };
    });
}

function buildCouponPerformance(orders, coupons) {
  const usageMap = new Map();

  orders.forEach((order) => {
    const code = String(order.couponCode || '').trim().toUpperCase();
    if (!code) return;
    const prev = usageMap.get(code) || {
      code,
      usageCount: 0,
      discountAmount: 0,
      orderAmount: 0,
    };
    prev.usageCount += 1;
    prev.discountAmount += Number(order.discount) || 0;
    prev.orderAmount += parseAmount(order.amount);
    usageMap.set(code, prev);
  });

  const now = new Date();
  return coupons
    .map((coupon) => {
      const code = String(coupon.code || '').toUpperCase();
      const usage = usageMap.get(code) || { usageCount: 0, discountAmount: 0, orderAmount: 0 };
      const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
      let status = coupon.status || 'active';
      if (expiry && expiry < now) status = 'expired';

      return {
        id: String(coupon._id),
        code,
        discountType: coupon.discountType || 'percentage',
        discountValue: Number(coupon.discountValue) || 0,
        status,
        catalogUsageCount: Number(coupon.usageCount) || 0,
        periodUsageCount: usage.usageCount,
        periodDiscountAmount: usage.discountAmount,
        periodOrderAmount: usage.orderAmount,
        usageLimit: Number(coupon.usageLimit) || 0,
        expiryDate: expiry?.toISOString() || null,
      };
    })
    .sort((a, b) => b.periodUsageCount - a.periodUsageCount || b.periodDiscountAmount - a.periodDiscountAmount);
}

function buildCouponUsageSeries(ordersWithCoupon, start, end) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const useDaily = days <= 14;
  const buckets = bucketCount(start, end);

  return Array.from({ length: buckets }, (_, index) => {
    const bucketStart = new Date(start);
    if (useDaily) bucketStart.setDate(bucketStart.getDate() + index);
    else if (days <= 90) bucketStart.setDate(bucketStart.getDate() + index * 7);
    else bucketStart.setMonth(bucketStart.getMonth() + index);

    const bucketEnd = new Date(bucketStart);
    if (useDaily) bucketEnd.setHours(23, 59, 59, 999);
    else if (days <= 90) {
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);
    } else {
      bucketEnd.setMonth(bucketEnd.getMonth() + 1, 0);
      bucketEnd.setHours(23, 59, 59, 999);
    }
    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const slice = filterOrdersInRange(ordersWithCoupon, bucketStart, bucketEnd);
    const name = useDaily
      ? bucketStart.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })
      : days <= 90
        ? `Wk ${index + 1}`
        : bucketStart.toLocaleDateString('en-LK', { month: 'short' });

    return {
      name,
      usage: slice.length,
      discount: slice.reduce((sum, order) => sum + (Number(order.discount) || 0), 0),
    };
  });
}

function buildInventoryCategoryBreakdown(stockReport) {
  const map = new Map();
  stockReport.forEach((item) => {
    const key = item.category || 'Uncategorized';
    const prev = map.get(key) || {
      name: key,
      products: 0,
      units: 0,
      lowStock: 0,
      outOfStock: 0,
    };
    prev.products += 1;
    prev.units += item.stock;
    if (item.status === 'low_stock') prev.lowStock += 1;
    if (item.status === 'out_of_stock') prev.outOfStock += 1;
    map.set(key, prev);
  });
  return [...map.values()].sort((a, b) => b.products - a.products);
}

class ReportsService {
  async getSalesReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);
    const financialList = filterRevenueEligibleOrders(list);

    const revenue = sumOrderRevenue(financialList);
    const orderCount = financialList.length;
    const completedOrderCount = countCompletedOrders(list);
    const profitSummary = aggregateOrdersProfit(
      financialList,
      context.productMap,
      context.shippingMethodById,
      context.shippingMethodByCost
    );

    return {
      success: true,
      metrics: {
        revenue,
        profit: profitSummary.profit,
        profitAvailable: profitSummary.profitAvailable,
        profitLabel: profitSummary.profitLabel,
        profitType: profitSummary.profitType,
        productRevenue: profitSummary.productRevenue,
        deliveryRevenue: profitSummary.deliveryRevenue,
        productCostTotal: profitSummary.productCostTotal,
        courierCostTotal: profitSummary.courierCostTotal,
        orderCount,
        completedOrderCount,
        avgOrderValue: orderCount ? revenue / orderCount : 0,
      },
      timeSeries: buildSalesTimeSeries(
        list,
        range.start,
        range.end,
        query.metric || 'revenue',
        context
      ),
      topProducts: buildTopProducts(context.orders, context.products, 5, range.start, range.end),
    };
  }

  async getProductReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);
    const filteredProducts = filterProducts(
      context.products,
      filters.categoryId,
      filters.productId,
      context.categoryNameById
    );

    const stockReport = buildStockReport(filteredProducts);
    const stats = {
      totalProducts: stockReport.length,
      outOfStock: stockReport.filter((item) => item.status === 'out_of_stock').length,
      lowStock: stockReport.filter((item) => item.status === 'low_stock').length,
      totalUnits: stockReport.reduce((sum, item) => sum + item.stock, 0),
    };

    const lowProductsResult = buildLowSellingProducts(
      context.orders,
      filteredProducts,
      10,
      range.start,
      range.end
    );

    return {
      success: true,
      stats,
      topProducts: buildTopProducts(context.orders, filteredProducts, 8, range.start, range.end),
      lowProducts: lowProductsResult.items,
      lowProductsTotal: lowProductsResult.totalCount,
      stockReport,
    };
  }

  async getCustomerReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);

    const customerSummary = computeCustomerSummary(
      context.orders,
      context.totalCustomers,
      range.start,
      range.end
    );

    const spendingData = buildCustomerSpending(context.orders, 10, range.start, range.end);
    const financialList = filterRevenueEligibleOrders(list);
    const totalSpent = sumOrderRevenue(financialList);
    const avgSpend = customerSummary.periodCustomers
      ? totalSpent / customerSummary.periodCustomers
      : 0;

    return {
      success: true,
      totalCustomers: context.totalCustomers,
      customerSummary,
      avgSpend,
      growthSeries: buildCustomerGrowthSeries(context.orders),
      spendingData,
    };
  }

  async getPaymentReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);

    const paidOrders = list.filter(isPaidPayment);
    const pendingOrders = list.filter(isPendingPayment);
    const failedOrders = list.filter(isFailedPayment);
    const refundedOrders = list.filter(isRefundedPayment);
    const codOrders = list.filter((order) => normalizePaymentMethod(order.paymentMethod) === 'cod');
    const bankOrders = list.filter(
      (order) => normalizePaymentMethod(order.paymentMethod) === 'bank_transfer'
    );

    const sumAmount = (orders) =>
      orders.reduce((sum, order) => sum + parseAmount(order.amount), 0);

    const metrics = {
      totalPayments: list.length,
      paidCount: paidOrders.length,
      paidAmount: sumAmount(paidOrders),
      pendingCount: pendingOrders.length,
      pendingAmount: sumAmount(pendingOrders),
      failedCount: failedOrders.length,
      failedAmount: sumAmount(failedOrders),
      refundedCount: refundedOrders.length,
      refundedAmount: sumAmount(refundedOrders),
      codCount: codOrders.length,
      codAmount: sumAmount(codOrders),
      bankTransferCount: bankOrders.length,
      bankTransferAmount: sumAmount(bankOrders),
    };

    return {
      success: true,
      metrics,
      statusChart: buildPaymentStatusChart(metrics),
      timeSeries: buildPaymentTimeSeries(list, range.start, range.end),
      methodPerformance: buildPaymentMethodPerformance(list),
      transactions: buildPaymentTransactions(list, 60),
    };
  }

  async getInventoryReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const filteredProducts = filterProducts(
      context.products,
      filters.categoryId,
      filters.productId,
      context.categoryNameById
    );
    const stockReport = buildStockReport(filteredProducts);
    const lowStockItems = stockReport.filter((item) => item.status === 'low_stock');
    const outOfStockItems = stockReport.filter((item) => item.status === 'out_of_stock');
    const inStockItems = stockReport.filter((item) => item.status === 'in_stock');

    return {
      success: true,
      metrics: {
        totalProducts: stockReport.length,
        totalUnits: stockReport.reduce((sum, item) => sum + item.stock, 0),
        inStock: inStockItems.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length,
        inventoryValue: stockReport.reduce((sum, item) => sum + item.stock * item.price, 0),
      },
      statusChart: [
        { name: 'In stock', value: inStockItems.length, fill: '#6b8f71' },
        { name: 'Low stock', value: lowStockItems.length, fill: '#d4a574' },
        { name: 'Out of stock', value: outOfStockItems.length, fill: '#c45c5c' },
      ].filter((entry) => entry.value > 0),
      categoryBreakdown: buildInventoryCategoryBreakdown(stockReport),
      stockReport: stockReport.slice(0, 80),
      lowStockItems: lowStockItems.slice(0, 30),
      outOfStockItems: outOfStockItems.slice(0, 30),
    };
  }

  async getCouponReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    const couponRows = buildCouponPerformance(list, coupons);
    const ordersWithCoupon = list.filter((order) => String(order.couponCode || '').trim());

    const now = new Date();
    const activeCount = coupons.filter((coupon) => {
      const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
      if (expiry && expiry < now) return false;
      return (coupon.status || 'active') === 'active';
    }).length;
    const expiredCount = coupons.filter((coupon) => {
      const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
      return (coupon.status || '') === 'expired' || (expiry && expiry < now);
    }).length;
    const inactiveCount = coupons.filter((coupon) => (coupon.status || '') === 'inactive').length;

    return {
      success: true,
      metrics: {
        totalCoupons: coupons.length,
        activeCoupons: activeCount,
        expiredCoupons: expiredCount,
        inactiveCoupons: inactiveCount,
        ordersWithCoupon: ordersWithCoupon.length,
        totalDiscountAmount: ordersWithCoupon.reduce(
          (sum, order) => sum + (Number(order.discount) || 0),
          0
        ),
        avgDiscount: ordersWithCoupon.length
          ? ordersWithCoupon.reduce((sum, order) => sum + (Number(order.discount) || 0), 0) /
            ordersWithCoupon.length
          : 0,
      },
      usageSeries: buildCouponUsageSeries(ordersWithCoupon, range.start, range.end),
      topCoupons: couponRows.filter((row) => row.periodUsageCount > 0).slice(0, 10),
      coupons: couponRows,
    };
  }

  async getOrderReport(query, authUser) {
    assertAdmin(authUser);
    const filters = parseReportQuery(query);
    const context = await loadReportContext();
    const { list, range } = applyReportFilters(context.orders, filters, context);
    const statusBreakdown = buildOrderStatusBreakdown(list);
    const cancelled = list.filter(isCancelledOrder);
    const delivered = list.filter(isCompletedOrder);
    const financialList = filterRevenueEligibleOrders(list);

    return {
      success: true,
      metrics: {
        totalOrders: list.length,
        deliveredCount: delivered.length,
        cancelledCount: cancelled.length,
        deliveryRate: list.length ? (delivered.length / list.length) * 100 : 0,
        cancellationRate: list.length ? (cancelled.length / list.length) * 100 : 0,
        paidOrders: financialList.length,
        revenue: sumOrderRevenue(financialList),
        avgOrderValue: financialList.length
          ? sumOrderRevenue(financialList) / financialList.length
          : 0,
      },
      statusBreakdown,
      timeSeries: buildOrderTimeSeries(list, range.start, range.end),
      recentOrders: buildRecentOrdersTable(list, 50),
    };
  }
}

module.exports = new ReportsService();
