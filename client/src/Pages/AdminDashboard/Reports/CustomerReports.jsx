import { useMemo, useState } from "react";
import { MdPeople, MdPayments, MdTrendingUp } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { computeCustomerSummary, getDateRange } from "../Dashboard/dashboardAnalytics";
import ReportFilters from "./ReportFilters";
import { CustomerGrowthReportChart, CustomerSpendingChart } from "./ReportCharts";
import useReportsData from "./useReportsData";
import {
  applyReportFilters,
  buildCustomerGrowthSeries,
  buildCustomerSpending,
  formatCurrency,
} from "./reportUtils";

export default function CustomerReports() {
  const { orders, categories, products, totalCustomers, usingSampleData, loading } = useReportsData();
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange = useMemo(
    () => getDateRange(appliedDatePreset, customStart, customEnd),
    [appliedDatePreset, customStart, customEnd]
  );

  const filteredOrders = useMemo(
    () =>
      applyReportFilters(orders, {
        start: dateRange.start,
        end: dateRange.end,
        categoryId: "all",
        productId: "all",
        categories,
        products,
      }),
    [orders, dateRange, categories, products]
  );

  const customerSummary = useMemo(
    () => computeCustomerSummary(orders, totalCustomers, dateRange.start, dateRange.end),
    [orders, totalCustomers, dateRange]
  );

  const growthSeries = useMemo(() => buildCustomerGrowthSeries(orders), [orders]);

  const spendingData = useMemo(
    () => buildCustomerSpending(filteredOrders, 10, dateRange.start, dateRange.end),
    [filteredOrders, dateRange]
  );

  const totalSpent = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.amount || order.total || 0), 0),
    [filteredOrders]
  );

  const avgSpend = customerSummary.periodCustomers
    ? totalSpent / customerSummary.periodCustomers
    : 0;

  return (
    <>
      <AdminPageHeader
        title="Customer Reports"
        subtitle="Track customer growth and spending patterns over time."
        breadcrumbs={[{ label: "Reports" }, { label: "Customer Reports" }]}
      />

      <div className="admin-dash__report-page">
        <section className="admin-dash__panel admin-dash__report-shell">
          {usingSampleData && (
            <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
              Showing sample report data — connect live customers and orders for real analytics.
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
            <StatCard icon={<MdPeople />} label="Total customers" value={totalCustomers} />
            <StatCard
              icon={<MdTrendingUp />}
              label="Customers in period"
              value={customerSummary.periodCustomers}
              gradient={["#8b6f47", "#b8860b"]}
            />
            <StatCard
              icon={<IoShieldCheckmarkSharp />}
              label="Returning rate"
              value={`${customerSummary.returningRate.toFixed(1)}%`}
              gradient={["#5a7a5e", "#7a9a7e"]}
            />
            <StatCard
              icon={<MdPayments />}
              label="Avg spend / customer"
              value={formatCurrency(avgSpend)}
              gradient={["#6b5344", "#d4a574"]}
            />
          </div>

          <div className="admin-dash__charts-row admin-dash__charts-row--2">
            <CustomerGrowthReportChart data={growthSeries} />
            <CustomerSpendingChart data={spendingData} />
          </div>

          <section className="admin-dash__panel admin-dash__report-table-panel">
            <div className="admin-dash__panel-head">
              <div>
                <h2 className="admin-dash__panel-title">Top spenders</h2>
                <p className="admin-dash__panel-desc">Customers with the highest total spend in the selected period</p>
              </div>
            </div>
            <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
              <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total spent</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="admin-dash__table-empty">
                        No customer spending data for this period.
                      </td>
                    </tr>
                  ) : (
                    spendingData.map((item) => (
                      <tr key={item.name}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.orders}</td>
                        <td><strong>{formatCurrency(item.spent)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          </>
        )}
      </div>
    </>
  );
}
