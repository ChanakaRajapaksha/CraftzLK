const LOW_STOCK_THRESHOLD = 5;
const MS_DAY = 86400000;

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

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isInRange(date, start, end) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function sumOrdersInRange(orders, start, end) {
  return orders.reduce((sum, order) => {
    const d = parseOrderDate(order);
    if (!d || !isInRange(d, start, end)) return sum;
    return sum + parseAmount(order.amount);
  }, 0);
}

export function filterOrdersInRange(orders, start, end) {
  return orders.filter((order) => {
    const d = parseOrderDate(order);
    return d && isInRange(d, start, end);
  });
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
  const totalRevenue = orders.reduce((s, o) => s + parseAmount(o.amount), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

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

export function computeOrderSummary(orders) {
  const counts = {
    total: orders.length,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  };

  orders.forEach((order) => {
    const s = normalizeStatus(order.status);
    if (s.includes("process")) counts.processing += 1;
    else if (s.includes("complete") || s.includes("deliver")) counts.completed += 1;
    else if (s.includes("cancel")) counts.cancelled += 1;
    else if (s.includes("return")) counts.returned += 1;
    else counts.pending += 1;
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
  };
}

export function computeCustomerSummary(orders, totalCustomers = 0) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const customerOrders = new Map();

  orders.forEach((order) => {
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
    const first = dates[0];
    if (first && first >= monthStart) newCustomers += 1;
    if (dates.length > 1) returningCustomers += 1;
  });

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
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

export function buildOrderStatusChart(orderSummary) {
  return [
    { name: "Pending", value: orderSummary.pending, fill: "#d4a574" },
    { name: "Processing", value: orderSummary.processing, fill: "#c9a961" },
    { name: "Completed", value: orderSummary.completed, fill: "#6b8f71" },
    { name: "Cancelled", value: orderSummary.cancelled, fill: "#c45c5c" },
    { name: "Returned", value: orderSummary.returned, fill: "#9a8b78" },
  ].filter((d) => d.value > 0);
}

export function buildTopProducts(orders, products, limit = 5) {
  const qtyMap = new Map();
  orders.forEach((order) => {
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

export function buildTopCategories(orders, catData, limit = 5) {
  const catMap = new Map();
  const productCat = new Map();

  (catData?.categoryList || []).forEach((cat) => {
    catMap.set(cat._id, cat.name);
    catMap.set(cat.name, cat.name);
  });

  orders.forEach((order) => {
    (order.products || []).forEach((item) => {
      const title = item.productTitle || "";
      productCat.set(title, productCat.get(title) || "General");
    });
  });

  const salesByCat = new Map();
  orders.forEach((order) => {
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

  return [...salesByCat.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function buildCustomerGrowth(orders) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    const monthOrders = filterOrdersInRange(orders, monthDate, end);
    const unique = new Set(
      monthOrders.map((o) => o.userid || o.userId || o.email).filter(Boolean)
    );
    return {
      name: monthDate.toLocaleDateString("en-US", { month: "short" }),
      customers: unique.size,
    };
  });
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
