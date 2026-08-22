const { parseAmount } = require('./reportDateRange');

function normalizeStatus(value) {
  return String(value || '').toLowerCase().trim();
}

function normalizePaymentStatus(order) {
  return normalizeStatus(order?.paymentStatus);
}

function normalizeOrderStatus(order) {
  return normalizeStatus(order?.status);
}

function isCancelledOrder(order) {
  return normalizeOrderStatus(order) === 'cancelled';
}

function isFailedPayment(order) {
  return normalizePaymentStatus(order) === 'failed';
}

function isRefundedPayment(order) {
  return normalizePaymentStatus(order) === 'refunded';
}

function isPaidPayment(order) {
  return normalizePaymentStatus(order) === 'paid';
}

function isPendingPayment(order) {
  return normalizePaymentStatus(order) === 'pending';
}

/** Revenue, profit, and AOV: paid, not cancelled, not failed, not refunded. */
function isRevenueEligibleOrder(order) {
  if (!order) return false;
  if (isCancelledOrder(order)) return false;
  if (isFailedPayment(order)) return false;
  if (isRefundedPayment(order)) return false;
  return isPaidPayment(order);
}

function isProfitEligibleOrder(order) {
  return isRevenueEligibleOrder(order);
}

/** Completed order: delivered with settled payment. */
function isCompletedOrder(order) {
  if (!order) return false;
  if (isCancelledOrder(order)) return false;
  if (!isPaidPayment(order)) return false;
  return normalizeOrderStatus(order) === 'delivered';
}

function filterRevenueEligibleOrders(orders = []) {
  return orders.filter(isRevenueEligibleOrder);
}

function getOrderRevenueAmount(order) {
  if (!isRevenueEligibleOrder(order)) return 0;
  return parseAmount(order.amount);
}

function sumOrderRevenue(orders = []) {
  return filterRevenueEligibleOrders(orders).reduce(
    (sum, order) => sum + parseAmount(order.amount),
    0
  );
}

function countCompletedOrders(orders = []) {
  return orders.filter(isCompletedOrder).length;
}

/** Payment transactions: success adds, refunded subtracts. */
function getTransactionFinancialAmount(transaction) {
  const amount = Number(transaction?.amount) || 0;
  const status = normalizeStatus(transaction?.status);

  if (status === 'success' || status === 'paid') return amount;
  if (status === 'refunded') return -amount;
  return 0;
}

function sumTransactionVolume(transactions = []) {
  return transactions.reduce(
    (sum, transaction) => sum + getTransactionFinancialAmount(transaction),
    0
  );
}

module.exports = {
  normalizePaymentStatus,
  normalizeOrderStatus,
  isCancelledOrder,
  isFailedPayment,
  isRefundedPayment,
  isPaidPayment,
  isPendingPayment,
  isRevenueEligibleOrder,
  isProfitEligibleOrder,
  isCompletedOrder,
  filterRevenueEligibleOrders,
  getOrderRevenueAmount,
  sumOrderRevenue,
  countCompletedOrders,
  getTransactionFinancialAmount,
  sumTransactionVolume,
};
