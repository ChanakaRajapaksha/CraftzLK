import { formatListDate } from "../Promotions/promoListHelpers";

export const TRANSACTION_STATUSES = [
  { value: "all", label: "All status" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export function formatTransactionAmount(amount, currency = "LKR") {
  const value = Number(amount || 0);
  return `${currency} ${value.toLocaleString()}`;
}

export function getTransactionStatusBadge(status) {
  const map = {
    success: { variant: "completed", label: "Success" },
    paid: { variant: "completed", label: "Paid" },
    pending: { variant: "pending", label: "Pending" },
    failed: { variant: "cancelled", label: "Failed" },
    cancelled: { variant: "cancelled", label: "Cancelled" },
    refunded: { variant: "returned", label: "Refunded" },
    chargedback: { variant: "returned", label: "Charged back" },
  };
  const entry = map[status] || { variant: "processing", label: status || "—" };
  return {
    className: `admin-dash__status-badge admin-dash__status-badge--${entry.variant}`,
    label: entry.label,
  };
}

export function formatTransactionDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { formatListDate };
