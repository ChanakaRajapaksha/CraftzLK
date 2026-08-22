function parseOptionalCost(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseAmount(value) {
  const n = parseFloat(String(value ?? 0).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function isCostAvailable(value) {
  if (value === null || value === undefined || value === '') return false;
  const n = Number(value);
  return Number.isFinite(n);
}

function isProductCostAvailable(product) {
  return isCostAvailable(product?.productCost);
}

function resolveCourierCost(order, shippingMethodById, shippingMethodByCost) {
  if (isCostAvailable(order.actualShippingCost)) {
    return { available: true, value: Number(order.actualShippingCost) };
  }

  const methodId = String(order.shippingMethodId || '').trim();
  if (methodId && shippingMethodById.has(methodId)) {
    const method = shippingMethodById.get(methodId);
    if (isCostAvailable(method.actualShippingCost)) {
      return { available: true, value: Number(method.actualShippingCost) };
    }
  }

  const customerShipping = parseAmount(order.shipping);
  if (shippingMethodByCost.has(customerShipping)) {
    const method = shippingMethodByCost.get(customerShipping);
    if (isCostAvailable(method.actualShippingCost)) {
      return { available: true, value: Number(method.actualShippingCost) };
    }
  }

  return { available: false, value: 0 };
}

function computeOrderProductTotals(order, productMap) {
  let productRevenue = 0;
  let productCostTotal = 0;
  let hasProductCost = true;

  (order.products || []).forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const sellingPrice = parseAmount(item.price);
    productRevenue += sellingPrice * qty;

    const product = productMap.get(String(item.productId || ''));
    if (!isProductCostAvailable(product)) {
      hasProductCost = false;
      return;
    }
    productCostTotal += Number(product.productCost) * qty;
  });

  if (!(order.products || []).length) {
    hasProductCost = false;
  }

  return { productRevenue, productCostTotal, hasProductCost };
}

const PROFIT_TYPES = {
  GROSS: 'gross_profit',
  PRODUCT: 'product_gross_profit',
  DELIVERY: 'delivery_margin',
  UNAVAILABLE: 'unavailable',
};

const PROFIT_LABELS = {
  [PROFIT_TYPES.GROSS]: 'Gross Profit',
  [PROFIT_TYPES.PRODUCT]: 'Product Gross Profit',
  [PROFIT_TYPES.DELIVERY]: 'Delivery Margin',
  [PROFIT_TYPES.UNAVAILABLE]: 'Profit',
};

function computeOrderProfit(order, productMap, shippingMethodById, shippingMethodByCost) {
  const { productRevenue, productCostTotal, hasProductCost } = computeOrderProductTotals(
    order,
    productMap
  );
  const deliveryRevenue = parseAmount(order.shipping);
  const courier = resolveCourierCost(order, shippingMethodById, shippingMethodByCost);

  let profit = null;
  let profitType = PROFIT_TYPES.UNAVAILABLE;

  if (hasProductCost && courier.available) {
    profit = productRevenue + deliveryRevenue - productCostTotal - courier.value;
    profitType = PROFIT_TYPES.GROSS;
  } else if (hasProductCost) {
    profit = productRevenue - productCostTotal;
    profitType = PROFIT_TYPES.PRODUCT;
  } else if (courier.available) {
    profit = deliveryRevenue - courier.value;
    profitType = PROFIT_TYPES.DELIVERY;
  }

  return {
    profit,
    profitType,
    productRevenue,
    deliveryRevenue,
    productCostTotal: hasProductCost ? productCostTotal : null,
    courierCost: courier.available ? courier.value : null,
  };
}

function aggregateOrdersProfit(orders, productMap, shippingMethodById, shippingMethodByCost) {
  let profit = 0;
  let profitAvailable = false;
  let productRevenue = 0;
  let deliveryRevenue = 0;
  let productCostTotal = 0;
  let courierCostTotal = 0;
  let hasAnyProductCost = false;
  let hasAnyCourierCost = false;
  const typeCounts = {
    [PROFIT_TYPES.GROSS]: 0,
    [PROFIT_TYPES.PRODUCT]: 0,
    [PROFIT_TYPES.DELIVERY]: 0,
    [PROFIT_TYPES.UNAVAILABLE]: 0,
  };

  orders.forEach((order) => {
    const result = computeOrderProfit(
      order,
      productMap,
      shippingMethodById,
      shippingMethodByCost
    );

    productRevenue += result.productRevenue;
    deliveryRevenue += result.deliveryRevenue;
    typeCounts[result.profitType] += 1;

    if (result.productCostTotal != null) {
      hasAnyProductCost = true;
      productCostTotal += result.productCostTotal;
    }

    if (result.courierCost != null) {
      hasAnyCourierCost = true;
      courierCostTotal += result.courierCost;
    }

    if (result.profit != null) {
      profitAvailable = true;
      profit += result.profit;
    }
  });

  const totalOrders = orders.length;
  let profitType = PROFIT_TYPES.UNAVAILABLE;

  if (profitAvailable) {
    if (typeCounts[PROFIT_TYPES.GROSS] === totalOrders) {
      profitType = PROFIT_TYPES.GROSS;
    } else if (typeCounts[PROFIT_TYPES.PRODUCT] === totalOrders) {
      profitType = PROFIT_TYPES.PRODUCT;
    } else if (typeCounts[PROFIT_TYPES.DELIVERY] === totalOrders) {
      profitType = PROFIT_TYPES.DELIVERY;
    } else if (hasAnyProductCost && hasAnyCourierCost) {
      profitType = PROFIT_TYPES.GROSS;
    } else if (hasAnyProductCost) {
      profitType = PROFIT_TYPES.PRODUCT;
    } else if (hasAnyCourierCost) {
      profitType = PROFIT_TYPES.DELIVERY;
    }
  }

  const profitLabel =
    profitAvailable && profitType !== PROFIT_TYPES.UNAVAILABLE
      ? PROFIT_LABELS[profitType]
      : 'Profit';

  return {
    profit: profitAvailable ? profit : null,
    profitAvailable,
    profitType,
    profitLabel,
    productRevenue,
    deliveryRevenue,
    productCostTotal: hasAnyProductCost ? productCostTotal : null,
    courierCostTotal: hasAnyCourierCost ? courierCostTotal : null,
  };
}

function sumOrderProfit(orders, productMap, shippingMethodById, shippingMethodByCost) {
  return aggregateOrdersProfit(
    orders,
    productMap,
    shippingMethodById,
    shippingMethodByCost
  ).profit ?? 0;
}

module.exports = {
  computeOrderProfit,
  aggregateOrdersProfit,
  sumOrderProfit,
  parseAmount,
  parseOptionalCost,
  isCostAvailable,
  PROFIT_TYPES,
  PROFIT_LABELS,
};
