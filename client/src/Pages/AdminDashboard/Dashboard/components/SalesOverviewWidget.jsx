import { formatCurrency } from "../dashboardAnalytics";

export default function SalesOverviewWidget({ metrics }) {
  const hasData =
    Number(metrics?.orderCount || 0) > 0 ||
    Number(metrics?.revenue || 0) > 0 ||
    Number(metrics?.itemsSold || 0) > 0;

  const items = [
    { label: "Recognized revenue", value: formatCurrency(metrics.revenue), accent: "revenue" },
    { label: "Paid orders", value: metrics.orderCount, accent: "orders" },
    { label: "Average order", value: formatCurrency(metrics.avgOrderValue), accent: "avg" },
    { label: "Items sold", value: metrics.itemsSold, accent: "items" },
    { label: "Delivered & paid", value: metrics.completedOrderCount ?? 0, accent: "completed" },
  ];

  return (
    <section className="admin-dash__widget admin-dash__widget--sales-overview">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Sales Overview</h2>
      </div>
      {hasData ? (
        <div className="admin-dash__sales-overview-grid">
          {items.map((item) => (
            <div
              key={item.label}
              className={`admin-dash__sales-metric admin-dash__sales-metric--${item.accent}`}
            >
              <span className="admin-dash__sales-metric-label">{item.label}</span>
              <span className="admin-dash__sales-metric-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-dash__widget-empty">No sales details for this period</p>
      )}
    </section>
  );
}
