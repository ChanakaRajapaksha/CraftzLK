import { useState } from "react";
import { MdPayments, MdAccountBalanceWallet, MdErrorOutline, MdLocalAtm } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportExportButtons from "./ReportExportButtons";
import ReportFilters from "./ReportFilters";
import {
  PaymentMethodChart,
  PaymentTrendChart,
  StatusDonutChart,
} from "./ReportCharts";
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

export default function PaymentReports() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data, loading, loadError } = useReportData("payments", {
    preset: appliedDatePreset,
    customStart,
    customEnd,
  });

  const metrics = data?.metrics || {
    totalPayments: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedCount: 0,
    refundedAmount: 0,
    codAmount: 0,
    bankTransferAmount: 0,
  };
  const transactions = data?.transactions || [];
  const methodPerformance = data?.methodPerformance || [];

  return (
    <>
      <AdminPageHeader
        title="Payment / Transaction Report"
        subtitle="Paid, pending, failed, and refunded transactions by method and date."
        breadcrumbs={[{ label: "Reports" }, { label: "Payment Report" }]}
        action={
          <ReportExportButtons
            reportType="payments"
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
              <StatCard icon={<MdPayments />} label="Total payments" value={metrics.totalPayments} />
              <StatCard
                icon={<MdAccountBalanceWallet />}
                label="Paid amount"
                value={formatCurrency(metrics.paidAmount)}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
              <StatCard
                icon={<MdLocalAtm />}
                label="Pending amount"
                value={formatCurrency(metrics.pendingAmount)}
                gradient={["#8b6f47", "#d4a574"]}
              />
              <StatCard
                icon={<MdErrorOutline />}
                label="Failed payments"
                value={metrics.failedCount}
                gradient={["#a52834", "#c45c5c"]}
              />
            </div>

            <div className="admin-dash__stats admin-dash__stats--report">
              <StatCard
                icon={<MdPayments />}
                label="Refunded amount"
                value={formatCurrency(metrics.refundedAmount)}
                gradient={["#6b5344", "#9a8b78"]}
              />
              <StatCard
                icon={<MdLocalAtm />}
                label="COD payments"
                value={formatCurrency(metrics.codAmount)}
                gradient={["#8b6f47", "#b8860b"]}
              />
              <StatCard
                icon={<MdAccountBalanceWallet />}
                label="Bank transfer"
                value={formatCurrency(metrics.bankTransferAmount)}
                gradient={["#4a5568", "#718096"]}
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <StatusDonutChart
                data={data?.statusChart || []}
                title="Payment status"
                subtitle="Transaction count by status"
                emptyLabel="No payment details for this period"
              />
              <PaymentMethodChart data={methodPerformance} />
            </div>

            <PaymentTrendChart data={data?.timeSeries || []} />

            <section className="admin-dash__panel admin-dash__report-table-panel">
              <div className="admin-dash__panel-head">
                <div>
                  <h2 className="admin-dash__panel-title">Payment transactions</h2>
                  <p className="admin-dash__panel-desc">Transactions by order in the selected period</p>
                </div>
              </div>
              {transactions.length ? (
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Order</th>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.transactionId}</strong>
                          </td>
                          <td>{row.orderNumber}</td>
                          <td>{row.paymentMethod}</td>
                          <td>
                            <strong>{formatCurrency(row.amount)}</strong>
                          </td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${
                                row.statusKey === "paid"
                                  ? "completed"
                                  : row.statusKey === "failed" || row.statusKey === "refunded"
                                    ? "cancelled"
                                    : "pending"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td>{formatDate(row.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-dash__widget-empty">No payment details for this period</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
