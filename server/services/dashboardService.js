const { Orders } = require('../models/orders');
const { Product } = require('../models/products');
const { ShippingMethod } = require('../models/shippingMethod');
const { Customers } = require('../models/customers');
const {
  getDateRange,
  getPreviousDateRange,
  getComparisonLabel,
  filterOrdersInRange,
  parseOrderDate,
  parseAmount,
} = require('../utils/reportDateRange');
const { aggregateOrdersProfit } = require('../utils/reportProfit');
const newsletterService = require('./newsletterService');
const {
  filterRevenueEligibleOrders,
  sumOrderRevenue,
  isRevenueEligibleOrder,
  isCompletedOrder,
  isPendingPayment,
  isFailedPayment,
  isRefundedPayment,
} = require('../utils/orderFinancialRules');

const LOW_STOCK_THRESHOLD = 5;

function assertAdmin(authUser) {
  if (authUser?.role !== 'admin') {
    const error = new Error('Login again to access this page.');
    error.statusCode = 401;
    error.payload = { success: false, message: error.message };
    throw error;
  }
}

function normalizeStatus(value) {
  return String(value || 'pending').toLowerCase().trim();
}

function computePercentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function makeTrend(current, previous) {
  const change = computePercentChange(current, previous);
  return {
    value: current,
    previous,
    change,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  };
}

async function loadDashboardContext() {
  const [orders, products, shippingMethods, totalCustomers] = await Promise.all([
    Orders.find().sort({ date: -1 }).lean(),
    Product.find().lean(),
    ShippingMethod.find().lean(),
    Customers.countDocuments(),
  ]);

  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const shippingMethodById = new Map(
    shippingMethods.map((method) => [String(method._id), method])
  );
  const shippingMethodByCost = new Map();
  shippingMethods.forEach((method) => {
    shippingMethodByCost.set(Number(method.cost) || 0, method);
  });

  return {
    orders,
    products,
    productMap,
    shippingMethodById,
    shippingMethodByCost,
    totalCustomers,
  };
}

function countItemsSold(orders, start, end) {
  return filterOrdersInRange(orders, start, end)
    .filter(isRevenueEligibleOrder)
    .reduce((sum, order) => {
      const items = (order.products || []).reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
      );
      return sum + items;
    }, 0);
}

function computePeriodMetrics(orders, start, end, context) {
  const periodOrders = filterOrdersInRange(orders, start, end);
  const financialOrders = filterRevenueEligibleOrders(periodOrders);
  const revenue = sumOrderRevenue(financialOrders);
  const orderCount = financialOrders.length;
  const profitSummary = aggregateOrdersProfit(
    financialOrders,
    context.productMap,
    context.shippingMethodById,
    context.shippingMethodByCost
  );

  return {
    revenue,
    orderCount,
    itemsSold: countItemsSold(orders, start, end),
    avgOrderValue: orderCount ? revenue / orderCount : 0,
    profit: profitSummary.profit,
    profitAvailable: profitSummary.profitAvailable,
    profitLabel: profitSummary.profitLabel,
    completedOrderCount: periodOrders.filter(isCompletedOrder).length,
    pendingPaymentCount: periodOrders.filter(isPendingPayment).length,
    failedPaymentCount: periodOrders.filter(isFailedPayment).length,
    refundedPaymentCount: periodOrders.filter(isRefundedPayment).length,
  };
}

function buildKpiComparisons(orders, preset, customStart, customEnd, context) {
  const current = getDateRange(preset, customStart, customEnd);
  const previous = getPreviousDateRange(preset, customStart, customEnd);
  const cur = computePeriodMetrics(orders, current.start, current.end, context);
  const prev = computePeriodMetrics(orders, previous.start, previous.end, context);

  return {
    revenue: makeTrend(cur.revenue, prev.revenue),
    orders: makeTrend(cur.orderCount, prev.orderCount),
    profit: makeTrend(cur.profit ?? 0, prev.profit ?? 0),
    profitAvailable: cur.profitAvailable,
    profitLabel: cur.profitLabel,
    comparisonLabel: getComparisonLabel(preset),
    period: cur,
  };
}

function computeOrderSummary(orders, start, end) {
  const list = start && end ? filterOrdersInRange(orders, start, end) : orders;
  const counts = {
    total: list.length,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  };

  list.forEach((order) => {
    const status = normalizeStatus(order.status);
    if (status.includes('cancel')) counts.cancelled += 1;
    else if (status.includes('return')) counts.returned += 1;
    else if (isCompletedOrder(order)) counts.completed += 1;
    else if (
      status.includes('process') ||
      status === 'confirmed' ||
      status === 'packed' ||
      status === 'shipped'
    ) {
      counts.processing += 1;
    } else counts.pending += 1;
  });

  return counts;
}

function buildOrderStatusChart(orderSummary) {
  return [
    { name: 'Pending', value: orderSummary.pending, fill: '#d4a574' },
    { name: 'Processing', value: orderSummary.processing, fill: '#c9a961' },
    { name: 'Completed', value: orderSummary.completed, fill: '#6b8f71' },
    { name: 'Cancelled', value: orderSummary.cancelled, fill: '#c45c5c' },
    { name: 'Returned', value: orderSummary.returned, fill: '#9a8b78' },
  ].filter((entry) => entry.value > 0);
}

function buildSalesTrendComparison(orders, metric, context) {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const currentMonth = now.getMonth();

  return months.slice(0, currentMonth + 1).map((name, idx) => {
    const thisStart = new Date(thisYear, idx, 1);
    const thisEnd =
      idx === currentMonth ? now : new Date(thisYear, idx + 1, 0, 23, 59, 59, 999);
    const lastStart = new Date(lastYear, idx, 1);
    const lastEnd = new Date(lastYear, idx + 1, 0, 23, 59, 59, 999);

    const thisOrders = filterRevenueEligibleOrders(
      filterOrdersInRange(orders, thisStart, thisEnd)
    );
    const lastOrders = filterRevenueEligibleOrders(
      filterOrdersInRange(orders, lastStart, lastEnd)
    );

    const thisRevenue = sumOrderRevenue(thisOrders);
    const lastRevenue = sumOrderRevenue(lastOrders);
    const thisProfit = aggregateOrdersProfit(
      thisOrders,
      context.productMap,
      context.shippingMethodById,
      context.shippingMethodByCost
    );
    const lastProfit = aggregateOrdersProfit(
      lastOrders,
      context.productMap,
      context.shippingMethodById,
      context.shippingMethodByCost
    );

    if (metric === 'orders') {
      return { name, current: thisOrders.length, previous: lastOrders.length };
    }
    if (metric === 'profit') {
      return {
        name,
        current: thisProfit.profit ?? 0,
        previous: lastProfit.profit ?? 0,
        profitAvailable: thisProfit.profitAvailable,
      };
    }
    return { name, current: thisRevenue, previous: lastRevenue };
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

function buildTopCategories(orders, products, limit, start, end) {
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const salesByCat = new Map();

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const product = productMap.get(String(item.productId || ''));
      const catName = item.catName || product?.catName || 'Uncategorized';
      salesByCat.set(catName, (salesByCat.get(catName) || 0) + Number(item.quantity || 1));
    });
  });

  if (salesByCat.size === 0) {
    return [];
  }

  const entries = [...salesByCat.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  return entries.map((entry) => ({
    ...entry,
    percent: total ? Math.round((entry.value / total) * 100) : 0,
  }));
}

function computeProductSummary(products) {
  let active = 0;
  let outOfStock = 0;
  let lowStock = 0;
  let draft = 0;

  products.forEach((product) => {
    const stock = Number(product.countInStock ?? 0);
    const hasBasics = Boolean(product.name?.trim()) && parseAmount(product.price) > 0;
    const hasImages = Array.isArray(product.images) && product.images.length > 0;

    if (!hasBasics || !hasImages) draft += 1;
    else if (stock <= 0) outOfStock += 1;
    else if (stock <= LOW_STOCK_THRESHOLD) lowStock += 1;
    else active += 1;
  });

  return {
    total: products.length,
    active,
    outOfStock,
    lowStock,
    draft,
    available: active,
  };
}

function computeCustomerSummary(orders, totalCustomers, start, end) {
  const rangeOrders = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const customerOrders = new Map();

  rangeOrders.forEach((order) => {
    const key = order.userid || order.userId || order.email;
    if (!key) return;
    const date = parseOrderDate(order);
    if (!customerOrders.has(String(key))) customerOrders.set(String(key), []);
    if (date) customerOrders.get(String(key)).push(date);
  });

  let newCustomers = 0;
  let returningCustomers = 0;

  customerOrders.forEach((dates) => {
    dates.sort((a, b) => a - b);
    if (dates.length > 1) returningCustomers += 1;
    else newCustomers += 1;
  });

  const periodCustomers = customerOrders.size;
  const returningRate = periodCustomers ? (returningCustomers / periodCustomers) * 100 : 0;

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    returningRate,
    periodCustomers,
  };
}

function buildRecentOrders(orders, limit, start, end) {
  const orderList = start && end ? filterOrdersInRange(orders, start, end) : orders;
  return [...orderList]
    .sort((a, b) => (parseOrderDate(b)?.getTime() || 0) - (parseOrderDate(a)?.getTime() || 0))
    .slice(0, limit)
    .map((order, index) => {
      const num = String(order._id || order.id || '').replace(/\D/g, '');
      return {
        id: order._id || order.id,
        orderNumber: order.orderNumber || `#${num ? 1000 + parseInt(num, 10) : 1001 + index}`,
        customer: order.name || 'Customer',
        amount: parseAmount(order.amount),
        status: normalizeStatus(order.status),
        paymentStatus: normalizeStatus(order.paymentStatus),
      };
    });
}

function getLowStockProducts(products, limit = 5) {
  return products
    .filter((product) => {
      const stock = Number(product.countInStock ?? 0);
      const hasBasics = Boolean(product.name?.trim()) && parseAmount(product.price) > 0;
      const hasImages = Array.isArray(product.images) && product.images.length > 0;
      return hasBasics && hasImages && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
    })
    .sort((a, b) => Number(a.countInStock) - Number(b.countInStock))
    .slice(0, limit)
    .map((product) => ({
      id: String(product._id),
      name: product.name,
      remaining: Number(product.countInStock ?? 0),
    }));
}

class DashboardService {
  async getOverview(query, authUser) {
    assertAdmin(authUser);

    const preset = query.preset || query.datePreset || 'today';
    const customStart = query.customStart || '';
    const customEnd = query.customEnd || '';
    const metric = query.metric || 'revenue';

    const context = await loadDashboardContext();
    const range = getDateRange(preset, customStart, customEnd);

    const kpis = buildKpiComparisons(
      context.orders,
      preset,
      customStart,
      customEnd,
      context
    );
    const orderSummary = computeOrderSummary(context.orders, range.start, range.end);
    const newsletterSummary = await newsletterService.getSubscriberStats();

    return {
      success: true,
      preset,
      comparisonLabel: kpis.comparisonLabel,
      kpis,
      orderSummary,
      orderStatusChart: buildOrderStatusChart(orderSummary),
      salesTrend: buildSalesTrendComparison(context.orders, metric, context),
      recentOrders: buildRecentOrders(context.orders, 5, range.start, range.end),
      topProducts: buildTopProducts(
        context.orders,
        context.products,
        5,
        range.start,
        range.end
      ),
      topCategories: buildTopCategories(
        context.orders,
        context.products,
        5,
        range.start,
        range.end
      ),
      productSummary: computeProductSummary(context.products),
      customerSummary: computeCustomerSummary(
        context.orders,
        context.totalCustomers,
        range.start,
        range.end
      ),
      newsletterSummary,
      lowStockProducts: getLowStockProducts(context.products, 5),
    };
  }
}

module.exports = new DashboardService();
