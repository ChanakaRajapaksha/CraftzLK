const { Orders } = require('../models/orders');
const { Product } = require('../models/products');
const { ShippingMethod } = require('../models/shippingMethod');
const { Customers } = require('../models/customers');
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
}

module.exports = new ReportsService();
