import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTooltipStyle } from "../../../Components/AdminDashboard/useChartTooltipStyle";

const CHART_COLORS = {
  revenue: "#b8860b",
  profit: "#6b8f71",
  orders: "#8b6f47",
  top: "#c9a961",
  low: "#9a8b78",
  stock: "#d4a574",
  customers: "#8b6f47",
  spending: "#b8860b",
};

function formatMoney(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export function ReportPanel({ title, subtitle, children, actions }) {
  return (
    <section className="admin-dash__panel admin-dash__chart-panel admin-dash__report-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">{title}</h2>
          {subtitle && <p className="admin-dash__panel-desc">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function SalesTrendReportChart({ data, metric, onMetricChange }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "profit", label: "Profit" },
    { id: "orders", label: "Orders" },
  ];

  const formatValue = (value) =>
    metric === "orders" ? value : formatMoney(value);

  return (
    <ReportPanel
      title="Sales performance"
      subtitle="Trend over the selected period"
      actions={
        <div className="admin-dash__pill-group">
          {metrics.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-dash__pill${metric === item.id ? " admin-dash__pill--active" : ""}`}
              onClick={() => onMetricChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            {metric === "orders" ? (
              <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Orders"]} />
                <Bar dataKey="orders" fill={CHART_COLORS.orders} radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`reportGrad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[metric]} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={CHART_COLORS[metric]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatValue(value), metric === "profit" ? "Profit" : "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={CHART_COLORS[metric]}
                  strokeWidth={2.5}
                  fill={`url(#reportGrad-${metric})`}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No sales data for the selected filters</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function SalesOverviewChart({ data }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  return (
    <ReportPanel title="Revenue vs orders" subtitle="Combined view for the selected period">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" fill={CHART_COLORS.orders} radius={[6, 6, 0, 0]} name="Orders" />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2.5} dot={{ r: 3 }} name="Revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No overview data for this period</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function ProductRankChart({ data, title, subtitle, dataKey = "qty", color = CHART_COLORS.top, emptyLabel }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  return (
    <ReportPanel title={title} subtitle={subtitle}>
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" horizontal={false} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="name" width={110} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">{emptyLabel}</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function StockLevelChart({ data }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  const colors = {
    out_of_stock: "#c45c5c",
    low_stock: "#d4a574",
    in_stock: "#6b8f71",
  };

  return (
    <ReportPanel title="Stock levels" subtitle="Current inventory by product">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.slice(0, 10)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTickSm} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
                {data.slice(0, 10).map((entry) => (
                  <Cell key={entry.id} fill={colors[entry.status] || CHART_COLORS.stock} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No stock data available</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function CustomerGrowthReportChart({ data }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  return (
    <ReportPanel title="Customer growth" subtitle="New and returning customers by month">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="customers" stroke={CHART_COLORS.customers} strokeWidth={2.5} dot={{ r: 4 }} name="Total customers" />
              <Line type="monotone" dataKey="newCustomers" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={{ r: 3 }} name="New" />
              <Line type="monotone" dataKey="returning" stroke={CHART_COLORS.low} strokeWidth={2} dot={{ r: 3 }} name="Returning" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No customer growth data</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function CustomerSpendingChart({ data }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  return (
    <ReportPanel title="Customer spending" subtitle="Top customers by total spend">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" horizontal={false} />
              <XAxis type="number" tick={axisTick} tickFormatter={(value) => `Rs ${value / 1000}k`} />
              <YAxis type="category" dataKey="name" width={110} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Spent"]} />
              <Bar dataKey="spent" fill={CHART_COLORS.spending} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No customer spending data</div>
        )}
      </div>
    </ReportPanel>
  );
}
