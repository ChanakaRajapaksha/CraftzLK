import {
  DATE_PRESETS,
  estimateProfit,
  filterOrdersInRange,
  formatCurrency,
  parseAmount,
  parseOrderDate,
} from "../Dashboard/dashboardAnalytics";

export { DATE_PRESETS, formatCurrency };

export function filterOrdersByCategory(orders, categoryId, categories = []) {
  if (!categoryId || categoryId === "all") return orders;
  const category = categories.find((item) => (item._id || item.id) === categoryId);
  const categoryName = category?.name;
  if (!categoryName) return orders;

  return orders.filter((order) =>
    (order.products || []).some(
      (item) =>
        item.catName === categoryName ||
        item.categoryId === categoryId ||
        item.category === categoryName
    )
  );
}

export function filterOrdersByProduct(orders, productId, products = []) {
  if (!productId || productId === "all") return orders;
  const product = products.find((item) => (item._id || item.id) === productId);
  const productName = product?.name;

  return orders.filter((order) =>
    (order.products || []).some(
      (item) =>
        item.productId === productId ||
        (productName && item.productTitle === productName)
    )
  );
}

export function applyReportFilters(orders, { start, end, categoryId, productId, categories, products }) {
  let list = filterOrdersInRange(orders, start, end);
  list = filterOrdersByCategory(list, categoryId, categories);
  list = filterOrdersByProduct(list, productId, products);
  return list;
}

export function computeSalesMetrics(orders) {
  const revenue = orders.reduce((sum, order) => sum + parseAmount(order.amount), 0);
  const orderCount = orders.length;
  const profit = estimateProfit(revenue);
  return { revenue, profit, orderCount };
}

function bucketCount(start, end) {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  if (days <= 14) return days;
  if (days <= 90) return Math.min(12, Math.ceil(days / 7));
  return Math.min(12, Math.ceil(days / 30));
}

export function buildSalesTimeSeries(orders, start, end, metric = "revenue") {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const useDaily = days <= 14;
  const bucketSize = useDaily ? 1 : days <= 90 ? 7 : 30;
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
    const revenue = slice.reduce((sum, order) => sum + parseAmount(order.amount), 0);
    const ordersCount = slice.length;
    const profit = estimateProfit(revenue);

    const name = useDaily
      ? bucketStart.toLocaleDateString("en-LK", { month: "short", day: "numeric" })
      : days <= 90
        ? `Wk ${index + 1}`
        : bucketStart.toLocaleDateString("en-LK", { month: "short" });

    return {
      name,
      revenue,
      profit,
      orders: ordersCount,
      value: metric === "orders" ? ordersCount : metric === "profit" ? profit : revenue,
    };
  });
}

export function buildLowSellingProducts(orders, products, limit = 8, start, end) {
  const orderList = start && end ? filterOrdersInRange(orders, start, end) : orders;
  const qtyMap = new Map();

  (products || []).forEach((product) => {
    const id = product._id || product.id;
    qtyMap.set(id, {
      id,
      name: product.name || "Product",
      qty: 0,
      revenue: 0,
      stock: Number(product.countInStock ?? 0),
    });
  });

  orderList.forEach((order) => {
    (order.products || []).forEach((item) => {
      const id = item.productId;
      const entry =
        qtyMap.get(id) ||
        qtyMap.set(id, {
          id,
          name: item.productTitle || "Product",
          qty: 0,
          revenue: 0,
          stock: 0,
        }).get(id);

      entry.qty += Number(item.quantity || 1);
      entry.revenue += parseAmount(item.subTotal || item.price * (item.quantity || 1));
    });
  });

  return [...qtyMap.values()]
    .sort((a, b) => a.qty - b.qty || a.revenue - b.revenue)
    .slice(0, limit);
}

export function buildStockReport(products) {
  return (products || [])
    .map((product) => {
      const stock = Number(product.countInStock ?? 0);
      let status = "in_stock";
      if (stock <= 0) status = "out_of_stock";
      else if (stock <= 5) status = "low_stock";

      return {
        id: product._id || product.id,
        name: product.name || "Product",
        category: product.catName || product.category || "—",
        stock,
        status,
        price: parseAmount(product.price),
      };
    })
    .sort((a, b) => a.stock - b.stock);
}

export function buildCustomerSpending(orders, limit = 10, start, end) {
  const orderList = start && end ? filterOrdersInRange(orders, start, end) : orders;
  const spendingMap = new Map();

  orderList.forEach((order) => {
    const key = order.userid || order.userId || order.email;
    if (!key) return;
    const label = order.name || order.email || "Customer";
    const prev = spendingMap.get(key) || { name: label, orders: 0, spent: 0 };
    prev.orders += 1;
    prev.spent += parseAmount(order.amount);
    spendingMap.set(key, prev);
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

export function buildCustomerGrowthSeries(orders) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    const monthOrders = filterOrdersInRange(orders, monthDate, end);
    const unique = new Set(
      monthOrders.map((order) => order.userid || order.userId || order.email).filter(Boolean)
    );
    const newCustomers = unique.size;
    const returning = [...unique].filter((key) => {
      const prior = orders.filter((order) => {
        const orderKey = order.userid || order.userId || order.email;
        if (orderKey !== key) return false;
        const date = parseOrderDate(order);
        return date && date < monthDate;
      });
      return prior.length > 0;
    }).length;

    return {
      name: monthDate.toLocaleDateString("en-LK", { month: "short" }),
      customers: newCustomers,
      returning,
      newCustomers: Math.max(0, newCustomers - returning),
    };
  });
}

export function getStockStatusLabel(status) {
  const map = {
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
  };
  return map[status] || status;
}

export function getStockStatusBadgeClass(status) {
  const map = {
    in_stock: "completed",
    low_stock: "pending",
    out_of_stock: "cancelled",
  };
  return map[status] || "processing";
}
