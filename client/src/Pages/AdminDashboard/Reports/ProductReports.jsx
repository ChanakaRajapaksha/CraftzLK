import { useMemo, useState } from "react";
import { MdInventory, MdShoppingBag, MdTrendingDown } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { buildTopProducts, getDateRange } from "../Dashboard/dashboardAnalytics";
import ReportFilters from "./ReportFilters";
import { ProductRankChart, StockLevelChart } from "./ReportCharts";
import useReportsData from "./useReportsData";
import {
  applyReportFilters,
  buildLowSellingProducts,
  buildStockReport,
  formatCurrency,
  getStockStatusBadgeClass,
  getStockStatusLabel,
} from "./reportUtils";

export default function ProductReports() {
  const { orders, products, categories, usingSampleData, loading } = useReportsData();
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [productId, setProductId] = useState("all");

  const dateRange = useMemo(
    () => getDateRange(appliedDatePreset, customStart, customEnd),
    [appliedDatePreset, customStart, customEnd]
  );

  const filteredOrders = useMemo(
    () =>
      applyReportFilters(orders, {
        start: dateRange.start,
        end: dateRange.end,
        categoryId,
        productId,
        categories,
        products,
      }),
    [orders, dateRange, categoryId, productId, categories, products]
  );

  const filteredProducts = useMemo(() => {
    if (categoryId === "all") return products;
    const category = categories.find((item) => (item._id || item.id) === categoryId);
    if (!category) return products;
    return products.filter(
      (product) =>
        product.catName === category.name ||
        product.categoryId === categoryId ||
        product.category === category.name
    );
  }, [products, categories, categoryId]);

  const topProducts = useMemo(
    () => buildTopProducts(filteredOrders, filteredProducts, 8, dateRange.start, dateRange.end),
    [filteredOrders, filteredProducts, dateRange]
  );

  const lowProducts = useMemo(
    () => buildLowSellingProducts(filteredOrders, filteredProducts, 8, dateRange.start, dateRange.end),
    [filteredOrders, filteredProducts, dateRange]
  );

  const stockReport = useMemo(() => buildStockReport(filteredProducts), [filteredProducts]);

  const stats = useMemo(() => {
    const outOfStock = stockReport.filter((item) => item.status === "out_of_stock").length;
    const lowStock = stockReport.filter((item) => item.status === "low_stock").length;
    const totalUnits = stockReport.reduce((sum, item) => sum + item.stock, 0);
    return {
      totalProducts: stockReport.length,
      outOfStock,
      lowStock,
      totalUnits,
    };
  }, [stockReport]);

  return (
    <>
      <AdminPageHeader
        title="Product Reports"
        subtitle="Top sellers, slow movers, and inventory health."
        breadcrumbs={[{ label: "Reports" }, { label: "Product Reports" }]}
      />

      <div className="admin-dash__report-page">
        <section className="admin-dash__panel admin-dash__report-shell">
          {usingSampleData && (
            <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
              Showing sample report data — connect live products and orders for real analytics.
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
              emptyLabel="No top product sales for this period"
            />
            <ProductRankChart
              data={lowProducts}
              title="Low selling products"
              subtitle="Products with the fewest units sold"
              dataKey="qty"
              color="#9a8b78"
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
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td>{item.stock}</td>
                          <td>
                            <span className={`admin-dash__status-badge admin-dash__status-badge--${getStockStatusBadgeClass(item.status)}`}>
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
