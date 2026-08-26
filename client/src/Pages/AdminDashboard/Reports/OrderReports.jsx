import { useState } from "react";
import { MdReceiptLong, MdLocalShipping, MdCancel, MdTrendingUp } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportExportButtons from "./ReportExportButtons";
import ReportFilters from "./ReportFilters";
import { OrderTrendChart, StatusDonutChart } from "./ReportCharts";
import useReportData from "./useReportData";
import { formatCurrency } from "./reportUtils";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function orderBadgeClass(status) {
  if (status === "delivered") return "completed";
  if (status === "cancelled" || status === "returned") return "cancelled";
  if (status === "shipped" || status === "packed" || status === "confirmed") return "processing";
  return "pending";
}

export default function OrderReports() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data, loading, loadError } = useReportData("orders", {
    preset: appliedDatePreset,
    customStart,
    customEnd,
  });

  const metrics = data?.metrics || {
    totalOrders: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    deliveryRate: 0,
    cancellationRate: 0,
    revenue: 0,
    avgOrderValue: 0,
  };
  const recentOrders = data?.recentOrders || [];

  return (
    <>
      <AdminPageHeader
        title="Order Report"
        subtitle="Orders by status, cancellations, and delivery performance."
        breadcrumbs={[{ label: "Reports" }, { label: "Order Report" }]}
        action={
          <ReportExportButtons
            reportType="orders"
            disabled={loading}
            filters={{
              preset: appliedDatePreset,
              customStart,
              customEnd,
            }}
          />
        }
      />

      <div className="admin-dash__report-page">
        <section className="admin-dash__panel admin-dash__report-shell">
          {loadError && (
            <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
              Could not load report data. Check your connection and try again.
            </p>
          )}
          <ReportFilters
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={({ start, end }) => {
              setCustomStart(start || "");
              setCustomEnd(end || "");
            }}
            onDateApply={setAppliedDatePreset}
            showCategory={false}
            showProduct={false}
          />
        </section>

        {loading ? (
          <p className="admin-dash__report-loading">Loading report data…</p>
        ) : (
          <>
            <div className="admin-dash__stats admin-dash__stats--report">
              <StatCard icon={<MdReceiptLong />} label="Total orders" value={metrics.totalOrders} />
              <StatCard
                icon={<MdLocalShipping />}
                label="Delivered & paid"
                value={metrics.deliveredCount}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
              <StatCard
                icon={<MdCancel />}
                label="Cancelled"
                value={metrics.cancelledCount}
                gradient={["#a52834", "#c45c5c"]}
              />
              <StatCard
                icon={<MdTrendingUp />}
                label="Delivery rate"
                value={`${Number(metrics.deliveryRate || 0).toFixed(1)}%`}
                gradient={["#8b6f47", "#b8860b"]}
              />
            </div>

            <div className="admin-dash__stats admin-dash__stats--report">
              <StatCard
                icon={<MdCancel />}
                label="Cancellation rate"
                value={`${Number(metrics.cancellationRate || 0).toFixed(1)}%`}
                gradient={["#6b5344", "#9a8b78"]}
              />
              <StatCard
                icon={<MdReceiptLong />}
                label="Paid revenue"
                value={formatCurrency(metrics.revenue)}
                gradient={["#8b6f47", "#b8860b"]}
              />
              <StatCard
                icon={<MdTrendingUp />}
                label="Avg order value"
                value={formatCurrency(metrics.avgOrderValue)}
                gradient={["#4a5568", "#718096"]}
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <StatusDonutChart
                data={data?.statusBreakdown || []}
                title="Orders by status"
                subtitle="Order count distribution"
                emptyLabel="No order details for this period"
              />
              <OrderTrendChart data={data?.timeSeries || []} />
            </div>

            <section className="admin-dash__panel admin-dash__report-table-panel">
              <div className="admin-dash__panel-head">
                <div>
                  <h2 className="admin-dash__panel-title">Orders in period</h2>
                  <p className="admin-dash__panel-desc">Recent orders matching the selected date range</p>
                </div>
              </div>
              {recentOrders.length ? (
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Method</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.orderNumber}</strong>
                          </td>
                          <td>{row.customer}</td>
                          <td>{formatCurrency(row.amount)}</td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${orderBadgeClass(
                                row.statusKey
                              )}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${
                                row.paymentStatusKey === "paid"
                                  ? "completed"
                                  : row.paymentStatusKey === "failed" ||
                                      row.paymentStatusKey === "refunded"
                                    ? "cancelled"
                                    : "pending"
                              }`}
                            >
                              {row.paymentStatus}
                            </span>
                          </td>
                          <td>{row.paymentMethod}</td>
                          <td>{formatDate(row.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-dash__widget-empty">No order details for this period</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
