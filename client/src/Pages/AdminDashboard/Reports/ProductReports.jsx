import { useState } from "react";
import { MdInventory, MdShoppingBag, MdTrendingDown } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportExportButtons from "./ReportExportButtons";
import ReportFilters from "./ReportFilters";
import { ProductRankChart, ProductRankTable, StockLevelChart } from "./ReportCharts";
import useReportFilters from "./useReportFilters";
import useProductReport from "./useProductReport";
import {
  formatCurrency,
  getStockStatusBadgeClass,
  getStockStatusLabel,
} from "./reportUtils";

export default function ProductReports() {
  const { categories, products, loading: filtersLoading, loadError: filtersError } =
    useReportFilters();
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [productId, setProductId] = useState("all");

  const { data, loading: reportLoading, loadError: reportError } = useProductReport({
    preset: appliedDatePreset,
    customStart,
    customEnd,
    categoryId,
    productId,
  });

  const loading = filtersLoading || reportLoading;
  const loadError = filtersError || reportError;
  const stats = data?.stats || {
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalUnits: 0,
  };
  const topProducts = data?.topProducts || [];
  const lowProducts = data?.lowProducts || [];
  const lowProductsTotal = data?.lowProductsTotal ?? lowProducts.length;
  const stockReport = data?.stockReport || [];

  return (
    <>
      <AdminPageHeader
        title="Product Reports"
        subtitle="Top sellers, slow movers, and inventory health."
        breadcrumbs={[{ label: "Reports" }, { label: "Product Reports" }]}
        action={
          <ReportExportButtons
            reportType="products"
            disabled={loading}
            filters={{
              preset: appliedDatePreset,
              customStart,
              customEnd,
              categoryId,
              productId,
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
              <StatCard icon={<MdShoppingBag />} label="Products tracked" value={stats.totalProducts} />
              <StatCard
                icon={<IoShieldCheckmarkSharp />}
                label="Total units in stock"
                value={stats.totalUnits}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
              <StatCard
                icon={<MdTrendingDown />}
                label="Low stock"
                value={stats.lowStock}
                gradient={["#6b5344", "#d4a574"]}
              />
              <StatCard
                icon={<MdInventory />}
                label="Out of stock"
                value={stats.outOfStock}
                gradient={["#8b4545", "#c45c5c"]}
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <ProductRankChart
                data={topProducts}
                title="Top products"
                subtitle="Highest selling products in the selected period"
                dataKey="qty"
                color="#c9a961"
                maxItems={8}
                emptyLabel="No top product sales for this period"
              />
              <ProductRankTable
                data={lowProducts}
                totalCount={lowProductsTotal}
                title="Low selling products"
                subtitle="Bottom slowest movers in the selected period"
                maxVisible={10}
                emptyLabel="No low-selling product data for this period"
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <StockLevelChart data={stockReport} />
              <section className="admin-dash__panel admin-dash__report-table-panel">
                <div className="admin-dash__panel-head">
                  <div>
                    <h2 className="admin-dash__panel-title">Stock report</h2>
                    <p className="admin-dash__panel-desc">Current inventory status by product</p>
                  </div>
                </div>
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockReport.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="admin-dash__table-empty">
                            No products match your filters.
                          </td>
                        </tr>
                      ) : (
                        stockReport.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.name}</strong>
                            </td>
                            <td>{item.category}</td>
                            <td>{item.stock}</td>
                            <td>
                              <span
                                className={`admin-dash__status-badge admin-dash__status-badge--${getStockStatusBadgeClass(item.status)}`}
                              >
                                {getStockStatusLabel(item.status)}
                              </span>
                            </td>
                            <td>{formatCurrency(item.stock * item.price)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
