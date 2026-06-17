import { formatCurrency } from "../dashboardAnalytics";

export default function SalesOverviewWidget({ metrics }) {
  const items = [
    { label: "Revenue", value: formatCurrency(metrics.revenue), accent: "revenue" },
    { label: "Orders", value: metrics.orderCount, accent: "orders" },
    { label: "Average Order", value: formatCurrency(metrics.avgOrderValue), accent: "avg" },
    { label: "Items Sold", value: metrics.itemsSold, accent: "items" },
  ];

  return (
    <section className="admin-dash__widget admin-dash__widget--sales-overview">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Sales Overview</h2>
      </div>
      <div className="admin-dash__sales-overview-grid">
        {items.map((item) => (
          <div key={item.label} className={`admin-dash__sales-metric admin-dash__sales-metric--${item.accent}`}>
            <span className="admin-dash__sales-metric-label">{item.label}</span>
            <span className="admin-dash__sales-metric-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
