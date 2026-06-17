import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const tooltipStyle = {
  background: "rgba(255,253,247,0.98)",
  border: "1px solid rgba(201,169,97,0.45)",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(92,77,58,0.12)",
  fontFamily: "inherit",
};

const ALL_STATUSES = [
  { key: "pending", label: "Pending", fill: "#d4a574" },
  { key: "processing", label: "Processing", fill: "#c9a961" },
  { key: "completed", label: "Completed", fill: "#6b8f71" },
  { key: "cancelled", label: "Cancelled", fill: "#c45c5c" },
  { key: "returned", label: "Returned", fill: "#9a8b78" },
];

export default function OrderStatusWidget({ orderSummary, chartData }) {
  const total = orderSummary.total;

  return (
    <section className="admin-dash__widget admin-dash__widget--order-status">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Order Status</h2>
      </div>

      <div className="admin-dash__order-status-total">
        <span className="admin-dash__order-status-total-label">Total Orders</span>
        <span className="admin-dash__order-status-total-value">{total}</span>
      </div>

      <div className="admin-dash__order-status-body">
        {chartData?.length ? (
          <div className="admin-dash__order-status-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="admin-dash__chart-empty">No orders in this period</div>
        )}

        <ul className="admin-dash__order-status-list">
          {ALL_STATUSES.map((status) => (
            <li key={status.key} className={`admin-dash__order-status-item admin-dash__order-status-item--${status.key}`}>
              <span className="admin-dash__legend-dot" style={{ background: status.fill }} />
              <span>{status.label}</span>
              <strong>{orderSummary[status.key] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
