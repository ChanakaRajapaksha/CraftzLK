export function normalizeStatus(value) {
  return String(value || "").toLowerCase().trim();
}

export function normalizePaymentStatus(order) {
  return normalizeStatus(order?.paymentStatus);
}

export function normalizeOrderStatus(order) {
  return normalizeStatus(order?.status);
}

export function isCancelledOrder(order) {
  return normalizeOrderStatus(order) === "cancelled";
}

export function isFailedPayment(order) {
  return normalizePaymentStatus(order) === "failed";
}

export function isRefundedPayment(order) {
  return normalizePaymentStatus(order) === "refunded";
}

export function isPaidPayment(order) {
  return normalizePaymentStatus(order) === "paid";
}

export function isRevenueEligibleOrder(order) {
  if (!order) return false;
  if (isCancelledOrder(order)) return false;
  if (isFailedPayment(order)) return false;
  if (isRefundedPayment(order)) return false;
  return isPaidPayment(order);
}

export function isProfitEligibleOrder(order) {
  return isRevenueEligibleOrder(order);
}

export function isCompletedOrder(order) {
  if (!order) return false;
  if (isCancelledOrder(order)) return false;
  if (!isPaidPayment(order)) return false;
  return normalizeOrderStatus(order) === "delivered";
}

export function filterRevenueEligibleOrders(orders = []) {
  return orders.filter(isRevenueEligibleOrder);
}

export function getOrderRevenueAmount(order, parseAmount) {
  if (!isRevenueEligibleOrder(order)) return 0;
  return parseAmount(order.amount);
}

export function sumOrderRevenue(orders = [], parseAmount) {
  return filterRevenueEligibleOrders(orders).reduce(
    (sum, order) => sum + parseAmount(order.amount),
    0
  );
}

export function countCompletedOrders(orders = []) {
  return orders.filter(isCompletedOrder).length;
}

export function getTransactionFinancialAmount(transaction) {
  const amount = Number(transaction?.amount) || 0;
  const status = normalizeStatus(transaction?.status);

  if (status === "success" || status === "paid") return amount;
  if (status === "refunded") return -amount;
  return 0;
}

export function sumTransactionVolume(transactions = []) {
  return transactions.reduce(
    (sum, transaction) => sum + getTransactionFinancialAmount(transaction),
    0
  );
}
