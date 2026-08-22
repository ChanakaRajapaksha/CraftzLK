import { useState } from "react";
import { MdPayments, MdReceiptLong, MdTrendingUp } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportFilters from "./ReportFilters";
import { SalesOverviewChart, SalesTrendReportChart } from "./ReportCharts";
import useReportFilters from "./useReportFilters";
import useSalesReport from "./useSalesReport";
import { formatCurrency } from "./reportUtils";

export default function SalesReports() {
  const { categories, products, loading: filtersLoading, loadError: filtersError } =
    useReportFilters();
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [productId, setProductId] = useState("all");
  const [chartMetric, setChartMetric] = useState("revenue");

  const { data, loading: reportLoading, loadError: reportError } = useSalesReport({
    preset: appliedDatePreset,
    customStart,
    customEnd,
    categoryId,
    productId,
    metric: chartMetric,
  });

  const loading = filtersLoading || reportLoading;
  const loadError = filtersError || reportError;
  const metrics = data?.metrics || {
    revenue: 0,
    profit: null,
    profitAvailable: false,
    profitLabel: "Profit",
    orderCount: 0,
    avgOrderValue: 0,
  };
  const timeSeries = data?.timeSeries || [];
  const topProducts = data?.topProducts || [];
  const profitDisplay = metrics.profitAvailable
    ? formatCurrency(metrics.profit)
    : "N/A";

  return (
    <>
      <AdminPageHeader
        title="Sales Reports"
        subtitle="Revenue, profit, and order trends with category and product filters."
        breadcrumbs={[{ label: "Reports" }, { label: "Sales Reports" }]}
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
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categories}
            productId={productId}
            onProductChange={setProductId}
            products={products}
          />
        </section>

        {loading ? (
          <p className="admin-dash__report-loading">Loading report data…</p>
        ) : (
          <>
            <div className="admin-dash__stats admin-dash__stats--report">
              <StatCard
                icon={<MdTrendingUp />}
                label="Revenue"
                value={formatCurrency(metrics.revenue)}
                gradient={["#8b6f47", "#b8860b"]}
              />
              <StatCard
                icon={<IoShieldCheckmarkSharp />}
                label={metrics.profitLabel || "Profit"}
                value={profitDisplay}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
              <StatCard
                icon={<MdReceiptLong />}
                label="Paid orders"
                value={metrics.orderCount}
                gradient={["#6b5344", "#d4a574"]}
              />
              <StatCard
                icon={<MdPayments />}
                label="Avg order value"
                value={formatCurrency(metrics.avgOrderValue)}
                gradient={["#4a5568", "#718096"]}
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <SalesTrendReportChart
                data={timeSeries}
                metric={chartMetric}
                onMetricChange={setChartMetric}
                profitMetricLabel={metrics.profitLabel || "Profit"}
              />
              <SalesOverviewChart data={timeSeries} />
            </div>

            {topProducts.length > 0 && (
              <section className="admin-dash__panel admin-dash__report-table-panel">
                <div className="admin-dash__panel-head">
                  <div>
                    <h2 className="admin-dash__panel-title">Top products in period</h2>
                    <p className="admin-dash__panel-desc">Best sellers matching your filters</p>
                  </div>
                </div>
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.qty}</td>
                          <td>
                            <strong>{formatCurrency(item.revenue)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
