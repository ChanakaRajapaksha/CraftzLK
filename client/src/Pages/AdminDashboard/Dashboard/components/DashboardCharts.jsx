import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "rgba(255,253,247,0.98)",
  border: "1px solid rgba(201,169,97,0.45)",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(92,77,58,0.12)",
  fontFamily: "inherit",
};

const METRIC_LABELS = {
  revenue: "Revenue",
  orders: "Orders",
  profit: "Profit",
};

export function SalesTrendChart({ data, metric, onMetricChange }) {
  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "orders", label: "Orders" },
    { id: "profit", label: "Profit" },
  ];

  const formatValue = (v) => {
    if (metric === "orders") return v;
    return `Rs ${Number(v).toLocaleString()}`;
  };

  return (
    <section className="admin-dash__widget admin-dash__widget--chart">
      <div className="admin-dash__widget-head">
        <div>
          <h2 className="admin-dash__widget-title">Sales Revenue</h2>
          <div className="admin-dash__chart-legend-inline">
            <span className="admin-dash__chart-legend-item">
              <span className="admin-dash__chart-legend-line admin-dash__chart-legend-line--current" />
              This Year
            </span>
            <span className="admin-dash__chart-legend-item">
              <span className="admin-dash__chart-legend-line admin-dash__chart-legend-line--previous" />
              Last Year
            </span>
          </div>
        </div>
        <div className="admin-dash__pill-group">
          {metrics.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`admin-dash__pill${metric === m.id ? " admin-dash__pill--active" : ""}`}
              onClick={() => onMetricChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5c4d3a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatValue(v), METRIC_LABELS[metric]]}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#b8860b"
                strokeWidth={2.5}
                dot={{ fill: "#b8860b", r: 4 }}
                activeDot={{ r: 6 }}
                name="This Year"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#9a8b78"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: "#9a8b78", r: 3 }}
                name="Last Year"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No sales data for this period</div>
        )}
      </div>
    </section>
  );
}

export function RevenueChartPanel({ data, period, onPeriodChange }) {
  const periods = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  return (
    <section className="admin-dash__panel admin-dash__chart-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Sales Revenue</h2>
          <p className="admin-dash__panel-desc">Revenue trend across your store</p>
        </div>
        <div className="admin-dash__pill-group">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-dash__pill${period === p.id ? " admin-dash__pill--active" : ""}`}
              onClick={() => onPeriodChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a961" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#c9a961" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5c4d3a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#b8860b" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No revenue data for this period</div>
        )}
      </div>
    </section>
  );
}

export function OrderStatusChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <section className="admin-dash__panel admin-dash__chart-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Order Status</h2>
          <p className="admin-dash__panel-desc">{total} orders tracked</p>
        </div>
      </div>
      <div className="admin-dash__chart admin-dash__chart--split">
        {data?.length ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="admin-dash__legend-list">
              {data.map((item) => (
                <li key={item.name}>
                  <span className="admin-dash__legend-dot" style={{ background: item.fill }} />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="admin-dash__chart-empty">No orders yet</div>
        )}
      </div>
    </section>
  );
}

export function TopProductsChart({ data }) {
  return (
    <section className="admin-dash__panel admin-dash__chart-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Top Selling Products</h2>
          <p className="admin-dash__panel-desc">By units sold</p>
        </div>
      </div>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#5c4d3a", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#5c4d3a", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="qty" fill="#c9a961" radius={[0, 8, 8, 0]} name="Units sold" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No product sales data</div>
        )}
      </div>
    </section>
  );
}

export function TopCategoriesChart({ data }) {
  return (
    <section className="admin-dash__panel admin-dash__chart-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Top Categories</h2>
          <p className="admin-dash__panel-desc">Best performing categories</p>
        </div>
      </div>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5c4d3a", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#b8860b" radius={[8, 8, 0, 0]} name="Units" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No category data</div>
        )}
      </div>
    </section>
  );
}

export function CustomerGrowthChart({ data }) {
  return (
    <section className="admin-dash__panel admin-dash__chart-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Customer Growth</h2>
          <p className="admin-dash__panel-desc">Unique customers per month</p>
        </div>
      </div>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5c4d3a", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#8b6f47"
                strokeWidth={2.5}
                dot={{ fill: "#b8860b", r: 4 }}
                activeDot={{ r: 6 }}
                name="Customers"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No customer data</div>
        )}
      </div>
    </section>
  );
}
