import {
  filterRevenueEligibleOrders,
  isRevenueEligibleOrder,
  isCompletedOrder,
  sumOrderRevenue,
} from "../../../utils/orderFinancialRules";

const LOW_STOCK_THRESHOLD = 5;
const MS_DAY = 86400000;
const PROFIT_MARGIN = 0.386;

export const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7days", label: "Last 7 Days" },
  { id: "thisWeek", label: "This Week" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

export function parseAmount(value) {
  const n = parseFloat(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function parseOrderDate(order) {
  const raw = order?.date || order?.dateOrdered || order?.createdAt;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isInRange(date, start, end) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

export function getDateRange(preset, customStart, customEnd) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "yesterday": {
      const start = new Date(todayStart.getTime() - MS_DAY);
      const end = new Date(todayStart.getTime() - 1);
      return { start, end };
    }
    case "last7days":
      return { start: new Date(todayStart.getTime() - 6 * MS_DAY), end: todayEnd };
    case "thisWeek":
      return { start: startOfWeek(now), end: todayEnd };
    case "thisMonth":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd };
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "thisYear":
      return { start: new Date(now.getFullYear(), 0, 1), end: todayEnd };
    case "custom": {
      const start = customStart ? startOfDay(new Date(customStart)) : todayStart;
      const end = customEnd ? endOfDay(new Date(customEnd)) : todayEnd;
      return { start, end };
    }
    case "today":
    default:
      return { start: todayStart, end: todayEnd };
  }
}

export function getPreviousDateRange(preset, customStart, customEnd) {
  const current = getDateRange(preset, customStart, customEnd);
  const duration = current.end.getTime() - current.start.getTime();
  const prevEnd = new Date(current.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

export function getComparisonLabel(preset) {
  const labels = {
    today: "yesterday",
    yesterday: "the day before",
    last7days: "previous 7 days",
    thisWeek: "last week",
    thisMonth: "last month",
    lastMonth: "previous month",
    thisYear: "last year",
    custom: "previous period",
  };
  return labels[preset] || "previous period";
}

export function sumOrdersInRange(orders, start, end) {
  return orders.reduce((sum, order) => {
    const d = parseOrderDate(order);
    if (!d || !isInRange(d, start, end) || !isRevenueEligibleOrder(order)) return sum;
    return sum + parseAmount(order.amount);
  }, 0);
}

export function filterOrdersInRange(orders, start, end) {
  return orders.filter((order) => {
    const d = parseOrderDate(order);
    return d && isInRange(d, start, end);
  });
}

export function countItemsSold(orders, start, end) {
  return filterOrdersInRange(orders, start, end)
    .filter(isRevenueEligibleOrder)
    .reduce((sum, order) => {
      const items = (order.products || []).reduce((s, item) => s + Number(item.quantity || 1), 0);
      return sum + items;
    }, 0);
}

export function countUniqueCustomers(orders, start, end) {
  const keys = new Set();
  filterOrdersInRange(orders, start, end)
    .filter(isRevenueEligibleOrder)
    .forEach((order) => {
      const key = order.userid || order.userId || order.email;
      if (key) keys.add(key);
    });
  return keys.size;
}

export function estimateProfit(revenue) {
  return revenue * PROFIT_MARGIN;
}

export function computePeriodMetrics(orders, start, end) {
  const filtered = filterRevenueEligibleOrders(filterOrdersInRange(orders, start, end));
  const revenue = sumOrderRevenue(filtered, parseAmount);
  const orderCount = filtered.length;
  const customers = countUniqueCustomers(orders, start, end);
  const itemsSold = countItemsSold(orders, start, end);
  const avgOrderValue = orderCount ? revenue / orderCount : 0;
  const profit = estimateProfit(revenue);

  return { revenue, orderCount, customers, itemsSold, avgOrderValue, profit };
}

export function computePercentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function buildKpiComparisons(orders, preset, customStart, customEnd) {
  const current = getDateRange(preset, customStart, customEnd);
  const previous = getPreviousDateRange(preset, customStart, customEnd);
  const cur = computePeriodMetrics(orders, current.start, current.end);
  const prev = computePeriodMetrics(orders, previous.start, previous.end);

  const makeTrend = (c, p) => {
    const change = computePercentChange(c, p);
    return {
      value: c,
      previous: p,
      change,
      direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    };
  };

  return {
    revenue: makeTrend(cur.revenue, prev.revenue),
    orders: makeTrend(cur.orderCount, prev.orderCount),
    profit: makeTrend(cur.profit, prev.profit),
    comparisonLabel: getComparisonLabel(preset),
    period: cur,
  };
}

export function computeSalesSummary(orders) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - MS_DAY);
  const yesterdayEnd = new Date(todayStart.getTime() - 1);
  const weekStart = new Date(todayStart.getTime() - 6 * MS_DAY);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todaySales = sumOrdersInRange(orders, todayStart, now);
  const yesterdaySales = sumOrdersInRange(orders, yesterdayStart, yesterdayEnd);
  const weekSales = sumOrdersInRange(orders, weekStart, now);
  const monthSales = sumOrdersInRange(orders, monthStart, now);
  const totalRevenue = sumOrderRevenue(orders, parseAmount);
  const eligibleOrders = filterRevenueEligibleOrders(orders);
  const avgOrderValue = eligibleOrders.length ? totalRevenue / eligibleOrders.length : 0;

  return {
    todaySales,
    yesterdaySales,
    weekSales,
    monthSales,
    totalRevenue,
    avgOrderValue,
  };
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase().trim();
}

export function computeOrderSummary(orders, start, end) {
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
    const s = normalizeStatus(order.status);
    if (s.includes("cancel")) counts.cancelled += 1;
    else if (s.includes("return")) counts.returned += 1;
    else if (isCompletedOrder(order)) counts.completed += 1;
    else if (s.includes("process") || s === "confirmed" || s === "packed" || s === "shipped") {
      counts.processing += 1;
    } else counts.pending += 1;
  });

  return counts;
}

export function computeProductSummary(products) {
  const list = Array.isArray(products) ? products : [];
  let active = 0;
  let outOfStock = 0;
  let lowStock = 0;
  let draft = 0;

  list.forEach((p) => {
    const stock = Number(p.countInStock ?? 0);
    const hasBasics = Boolean(p.name?.trim()) && parseAmount(p.price) > 0;
    const hasImages = Array.isArray(p.images) && p.images.length > 0;

    if (!hasBasics || !hasImages) {
      draft += 1;
    } else if (stock <= 0) {
      outOfStock += 1;
    } else if (stock <= LOW_STOCK_THRESHOLD) {
      lowStock += 1;
    } else {
      active += 1;
    }
  });

  return {
    total: list.length,
    active,
    outOfStock,
    lowStock,
    draft,
    available: active,
  };
}

export function computeCustomerSummary(orders, totalCustomers = 0, start, end) {
  const rangeOrders = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const customerOrders = new Map();

  rangeOrders.forEach((order) => {
    const key = order.userid || order.userId || order.email;
    if (!key) return;
    const d = parseOrderDate(order);
    if (!customerOrders.has(key)) customerOrders.set(key, []);
    if (d) customerOrders.get(key).push(d);
  });

  let newCustomers = 0;
  let returningCustomers = 0;

  customerOrders.forEach((dates) => {
    dates.sort((a, b) => a - b);
    if (dates.length > 1) returningCustomers += 1;
    else newCustomers += 1;
  });

  const totalInPeriod = customerOrders.size;
  const returningRate = totalInPeriod ? (returningCustomers / totalInPeriod) * 100 : 0;

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    returningRate,
    periodCustomers: totalInPeriod,
  };
}

export function buildRevenueChartData(orders, period = "monthly") {
  const now = new Date();

  if (period === "daily") {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const next = new Date(day.getTime() + MS_DAY - 1);
      return {
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: sumOrdersInRange(orders, day, next),
      };
    });
  }

  if (period === "weekly") {
    return Array.from({ length: 8 }, (_, i) => {
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (7 - i) * 7);
      const weekStart = new Date(weekEnd.getTime() - 6 * MS_DAY);
      weekStart.setHours(0, 0, 0, 0);
      return {
        name: `W${8 - i}`,
        revenue: sumOrdersInRange(orders, weekStart, weekEnd),
      };
    });
  }

  if (period === "yearly") {
    const year = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const y = year - (4 - i);
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59);
      return {
        name: String(y),
        revenue: sumOrdersInRange(orders, start, end),
      };
    });
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = now.getFullYear();
  return months.map((name, idx) => {
    const start = new Date(year, idx, 1);
    const end = new Date(year, idx + 1, 0, 23, 59, 59);
    return { name, revenue: sumOrdersInRange(orders, start, end) };
  });
}

export function buildSalesTrendComparison(orders, metric = "revenue") {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const currentMonth = now.getMonth();

  return months.slice(0, currentMonth + 1).map((name, idx) => {
    const thisStart = new Date(thisYear, idx, 1);
    const thisEnd = idx === currentMonth ? now : new Date(thisYear, idx + 1, 0, 23, 59, 59, 999);
    const lastStart = new Date(lastYear, idx, 1);
    const lastEnd = new Date(lastYear, idx + 1, 0, 23, 59, 59, 999);

    const thisOrders = filterRevenueEligibleOrders(filterOrdersInRange(orders, thisStart, thisEnd));
    const lastOrders = filterRevenueEligibleOrders(filterOrdersInRange(orders, lastStart, lastEnd));

    const thisRevenue = sumOrderRevenue(thisOrders, parseAmount);
    const lastRevenue = sumOrderRevenue(lastOrders, parseAmount);

    if (metric === "orders") {
      return { name, current: thisOrders.length, previous: lastOrders.length };
    }
    if (metric === "profit") {
      return { name, current: estimateProfit(thisRevenue), previous: estimateProfit(lastRevenue) };
    }
    return { name, current: thisRevenue, previous: lastRevenue };
  });
}

export function buildOrderStatusChart(orderSummary) {
  return [
    { name: "Pending", value: orderSummary.pending, fill: "#d4a574" },
    { name: "Processing", value: orderSummary.processing, fill: "#c9a961" },
    { name: "Completed", value: orderSummary.completed, fill: "#6b8f71" },
    { name: "Cancelled", value: orderSummary.cancelled, fill: "#c45c5c" },
    { name: "Returned", value: orderSummary.returned, fill: "#9a8b78" },
  ].filter((d) => d.value > 0);
}

export function buildTopProducts(orders, products, limit = 5, start, end) {
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const qtyMap = new Map();

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const id = item.productId || item.productTitle;
      if (!id) return;
      const prev = qtyMap.get(id) || { name: item.productTitle || "Product", qty: 0, revenue: 0 };
      prev.qty += Number(item.quantity || 1);
      prev.revenue += parseAmount(item.subTotal || item.price * (item.quantity || 1));
      qtyMap.set(id, prev);
    });
  });

  const productById = new Map();
  (products || []).forEach((p) => {
    productById.set(p.id || p._id, p);
    productById.set(p.name, p);
  });

  return [...qtyMap.entries()]
    .map(([id, data]) => {
      const p = productById.get(id);
      return {
        id,
        name: p?.name || data.name,
        image: p?.images?.[0] || "",
        qty: data.qty,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function buildTopCategories(orders, catData, limit = 5, start, end) {
  const orderList = filterRevenueEligibleOrders(
    start && end ? filterOrdersInRange(orders, start, end) : orders
  );
  const salesByCat = new Map();

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const catName = item.catName || "Uncategorized";
      salesByCat.set(catName, (salesByCat.get(catName) || 0) + Number(item.quantity || 1));
    });
  });

  if (salesByCat.size === 0 && catData?.categoryList?.length) {
    return catData.categoryList.slice(0, limit).map((cat) => ({
      name: cat.name,
      value: (cat.children?.length || 0) + 1,
    }));
  }

  const entries = [...salesByCat.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const total = entries.reduce((s, e) => s + e.value, 0);
  return entries.map((e) => ({
    ...e,
    percent: total ? Math.round((e.value / total) * 100) : 0,
  }));
}

export function buildCustomerGrowth(orders) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    const monthOrders = filterRevenueEligibleOrders(filterOrdersInRange(orders, monthDate, end));
    const unique = new Set(
      monthOrders.map((o) => o.userid || o.userId || o.email).filter(Boolean)
    );
    return {
      name: monthDate.toLocaleDateString("en-US", { month: "short" }),
      customers: unique.size,
    };
  });
}

export function buildRecentOrders(orders, limit = 5, start, end) {
  const orderList = start && end ? filterOrdersInRange(orders, start, end) : orders;
  return [...orderList]
    .sort((a, b) => (parseOrderDate(b)?.getTime() || 0) - (parseOrderDate(a)?.getTime() || 0))
    .slice(0, limit)
    .map((order, i) => {
      const num = String(order._id || order.id || "").replace(/\D/g, "");
      return {
        id: order._id || order.id,
        orderNumber: order.orderNumber || `#${num ? 1000 + parseInt(num, 10) : 1001 + i}`,
        customer: order.name || "Customer",
        amount: parseAmount(order.amount),
        status: normalizeStatus(order.status),
      };
    });
}

export function getLowStockProducts(products, limit = 5) {
  return (products || [])
    .filter((p) => {
      const stock = Number(p.countInStock ?? 0);
      const hasBasics = Boolean(p.name?.trim()) && parseAmount(p.price) > 0;
      const hasImages = Array.isArray(p.images) && p.images.length > 0;
      return hasBasics && hasImages && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
    })
    .sort((a, b) => Number(a.countInStock) - Number(b.countInStock))
    .slice(0, limit)
    .map((p) => ({
      id: p.id || p._id,
      name: p.name,
      remaining: Number(p.countInStock ?? 0),
    }));
}

export function buildRecentActivities(orders, products, reviewsCount) {
  const activities = [];

  [...orders]
    .sort((a, b) => (parseOrderDate(b)?.getTime() || 0) - (parseOrderDate(a)?.getTime() || 0))
    .slice(0, 4)
    .forEach((order) => {
      activities.push({
        id: `order-${order._id || order.id}`,
        type: "order",
        title: "New order received",
        detail: `${order.name || "Customer"} — Rs ${parseAmount(order.amount).toLocaleString()}`,
        time: parseOrderDate(order),
      });
    });

  [...(products || [])]
    .slice(-2)
    .forEach((p) => {
      activities.push({
        id: `product-${p._id || p.id}`,
        type: "product",
        title: "Product updated",
        detail: p.name || "Product catalogue",
        time: new Date(),
      });
    });

  if (reviewsCount > 0) {
    activities.push({
      id: "reviews",
      type: "review",
      title: "Review added",
      detail: `${reviewsCount} total product reviews`,
      time: new Date(),
    });
  }

  const seenEmails = new Set();
  orders.forEach((order) => {
    const email = order.email;
    if (!email || seenEmails.has(email)) return;
    seenEmails.add(email);
    activities.push({
      id: `customer-${email}`,
      type: "customer",
      title: "Customer registered",
      detail: order.name || email,
      time: parseOrderDate(order),
    });
  });

  return activities
    .filter((a) => a.time)
    .sort((a, b) => b.time - a.time)
    .slice(0, 8);
}

export function formatCurrency(amount) {
  return `Rs ${Math.round(parseAmount(amount)).toLocaleString()}`;
}

export function formatCompact(value) {
  if (typeof value === "string" && value.startsWith("Rs")) return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString();
}

export function formatPercentChange(change) {
  const abs = Math.abs(change).toFixed(1);
  return `${abs}%`;
}

export function getStatusBadgeClass(status) {
  const s = normalizeStatus(status);
  if (s === "paid") return "completed";
  if (s === "failed") return "cancelled";
  if (s === "refunded") return "returned";
  if (s.includes("complete") || s.includes("deliver")) return "completed";
  if (s.includes("process") || s === "confirmed" || s === "packed" || s === "shipped") {
    return "processing";
  }
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("return")) return "returned";
  return "pending";
}
