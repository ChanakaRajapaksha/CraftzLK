export function getPromoStatusBadge(status) {
  const map = {
    active: { variant: "completed", label: "Active" },
    inactive: { variant: "cancelled", label: "Inactive" },
    expired: { variant: "returned", label: "Expired" },
    scheduled: { variant: "pending", label: "Scheduled" },
  };
  const entry = map[status] || { variant: "processing", label: status || "—" };
  return {
    className: `admin-dash__status-badge admin-dash__status-badge--${entry.variant}`,
    label: entry.label,
  };
}

export function formatListDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
