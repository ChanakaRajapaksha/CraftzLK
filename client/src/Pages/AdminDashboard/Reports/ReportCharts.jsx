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
  Pie,
  PieChart,
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
  paid: "#6b8f71",
  pending: "#d4a574",
  failed: "#c45c5c",
  refunded: "#9a8b78",
  delivered: "#6b8f71",
  cancelled: "#c45c5c",
  discount: "#b8860b",
  usage: "#8b6f47",
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

export function SalesTrendReportChart({ data, metric, onMetricChange, profitMetricLabel = "Profit" }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  const metrics = [
    { id: "revenue", label: "Revenue" },
    { id: "profit", label: profitMetricLabel },
    { id: "orders", label: "Orders" },
  ];

  const formatValue = (value) =>
    metric === "orders" ? value : formatMoney(value ?? 0);

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
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, item) => {
                    if (metric === "profit" && item?.payload?.profitAvailable === false) {
                      return ["N/A", profitMetricLabel];
                    }
                    return [formatValue(value), metric === "profit" ? profitMetricLabel : "Revenue"];
                  }}
                />
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

export function ProductRankChart({
  data,
  title,
  subtitle,
  dataKey = "qty",
  color = CHART_COLORS.top,
  emptyLabel,
  maxItems = 8,
}) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  const chartData = (data || []).slice(0, maxItems);
  const rowHeight = 44;
  const chartHeight = Math.max(220, chartData.length * rowHeight + 16);

  const truncateLabel = (value) => {
    const label = String(value || "");
    return label.length > 24 ? `${label.slice(0, 22)}…` : label;
  };

  return (
    <ReportPanel title={title} subtitle={subtitle}>
      <div className="admin-dash__chart admin-dash__chart--rank">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" horizontal={false} />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                tick={axisTick}
                tickFormatter={truncateLabel}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(label) => String(label || "")}
              />
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

function formatRankMoney(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export function ProductRankTable({
  data,
  title,
  subtitle,
  emptyLabel,
  totalCount,
  maxVisible = 10,
}) {
  const rows = (data || []).slice(0, maxVisible);
  const catalogTotal = totalCount ?? data?.length ?? 0;
  const footer =
    catalogTotal > rows.length
      ? `Showing bottom ${rows.length} of ${catalogTotal} products`
      : null;

  return (
    <ReportPanel
      title={title}
      subtitle={subtitle}
      actions={
        footer ? <span className="admin-dash__chart-meta">{footer}</span> : null
      }
    >
      {rows.length ? (
        <div className="admin-dash__rank-table-scroll">
          <table className="admin-dash__table admin-dash__table--modern admin-dash__table--rank">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Units sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={item.id || item.name}>
                  <td>{index + 1}</td>
                  <td>
                    <strong title={item.name}>{item.name}</strong>
                  </td>
                  <td>{item.qty ?? 0}</td>
                  <td>{formatRankMoney(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-dash__chart-empty">{emptyLabel}</div>
      )}
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

export function StatusDonutChart({ data, title, subtitle, emptyLabel = "No details available" }) {
  const { tooltipStyle } = useChartTooltipStyle();
  const total = (data || []).reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <ReportPanel title={title} subtitle={subtitle}>
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
                  innerRadius={54}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill || CHART_COLORS.revenue} />
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
                  <strong>
                    {item.value}
                    {total ? ` (${Math.round((item.value / total) * 100)}%)` : ""}
                  </strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="admin-dash__chart-empty">{emptyLabel}</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function PaymentTrendChart({ data }) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  return (
    <ReportPanel title="Payments by date" subtitle="Paid, pending, failed, and refunded amounts">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value)]} />
              <Legend />
              <Area type="monotone" dataKey="paid" stackId="1" stroke={CHART_COLORS.paid} fill={CHART_COLORS.paid} fillOpacity={0.55} name="Paid" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke={CHART_COLORS.pending} fill={CHART_COLORS.pending} fillOpacity={0.45} name="Pending" />
              <Area type="monotone" dataKey="failed" stackId="1" stroke={CHART_COLORS.failed} fill={CHART_COLORS.failed} fillOpacity={0.4} name="Failed" />
              <Area type="monotone" dataKey="refunded" stackId="1" stroke={CHART_COLORS.refunded} fill={CHART_COLORS.refunded} fillOpacity={0.35} name="Refunded" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No payment details for this period</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function PaymentMethodChart({ data }) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  return (
    <ReportPanel title="Payment method performance" subtitle="Total amount by payment method">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Amount"]} />
              <Bar dataKey="totalAmount" fill={CHART_COLORS.revenue} radius={[8, 8, 0, 0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No payment method details</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function OrderTrendChart({ data }) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  return (
    <ReportPanel title="Orders over time" subtitle="Orders, deliveries, and cancellations">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="orders" fill={CHART_COLORS.orders} radius={[6, 6, 0, 0]} name="Orders" />
              <Line type="monotone" dataKey="delivered" stroke={CHART_COLORS.delivered} strokeWidth={2.5} name="Delivered" />
              <Line type="monotone" dataKey="cancelled" stroke={CHART_COLORS.cancelled} strokeWidth={2} name="Cancelled" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No order details for this period</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function CouponUsageChart({ data }) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  return (
    <ReportPanel title="Coupon usage trend" subtitle="Usage count and discount amount over time">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis yAxisId="left" tick={axisTick} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) =>
                  name === "Discount" ? [formatMoney(value), name] : [value, name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="usage" fill={CHART_COLORS.usage} radius={[6, 6, 0, 0]} name="Usage" />
              <Line yAxisId="right" type="monotone" dataKey="discount" stroke={CHART_COLORS.discount} strokeWidth={2.5} name="Discount" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No coupon usage details</div>
        )}
      </div>
    </ReportPanel>
  );
}

export function InventoryCategoryChart({ data }) {
  const { tooltipStyle, axisTick } = useChartTooltipStyle();
  return (
    <ReportPanel title="Stock by category" subtitle="Product count and units by category">
      <div className="admin-dash__chart">
        {data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.slice(0, 8)} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="products" fill={CHART_COLORS.orders} radius={[6, 6, 0, 0]} name="Products" />
              <Bar dataKey="units" fill={CHART_COLORS.stock} radius={[6, 6, 0, 0]} name="Units" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-dash__chart-empty">No inventory category details</div>
        )}
      </div>
    </ReportPanel>
  );
}
