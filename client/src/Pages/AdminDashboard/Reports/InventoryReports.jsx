import { useState } from "react";
import { MdInventory, MdWarning, MdRemoveShoppingCart, MdAttachMoney } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportExportButtons from "./ReportExportButtons";
import ReportFilters from "./ReportFilters";
import { InventoryCategoryChart, StatusDonutChart, StockLevelChart } from "./ReportCharts";
import useReportData from "./useReportData";
import useReportFilters from "./useReportFilters";
import { formatCurrency } from "./reportUtils";

function stockBadgeClass(status) {
  if (status === "out_of_stock") return "cancelled";
  if (status === "low_stock") return "pending";
  return "completed";
}

function stockLabel(status) {
  if (status === "out_of_stock") return "Out of stock";
  if (status === "low_stock") return "Low stock";
  return "In stock";
}

export default function InventoryReports() {
  const { categories, products, loading: filtersLoading, loadError: filtersError } =
    useReportFilters();
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [productId, setProductId] = useState("all");

  const { data, loading: reportLoading, loadError: reportError } = useReportData("inventory", {
    preset: appliedDatePreset,
    customStart,
    customEnd,
    categoryId,
    productId,
  });

  const loading = filtersLoading || reportLoading;
  const loadError = filtersError || reportError;
  const metrics = data?.metrics || {
    totalProducts: 0,
    totalUnits: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
  };
  const stockReport = data?.stockReport || [];

  return (
    <>
      <AdminPageHeader
        title="Inventory / Stock Report"
        subtitle="Current stock, low stock, out-of-stock items, and category breakdown."
        breadcrumbs={[{ label: "Reports" }, { label: "Inventory Report" }]}
        action={
          <ReportExportButtons
            reportType="inventory"
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
              <StatCard icon={<MdInventory />} label="Total products" value={metrics.totalProducts} />
              <StatCard
                icon={<MdInventory />}
                label="Total units"
                value={metrics.totalUnits}
                gradient={["#8b6f47", "#b8860b"]}
              />
              <StatCard
                icon={<MdWarning />}
                label="Low stock"
                value={metrics.lowStock}
                gradient={["#8b6f47", "#d4a574"]}
              />
              <StatCard
                icon={<MdRemoveShoppingCart />}
                label="Out of stock"
                value={metrics.outOfStock}
                gradient={["#a52834", "#c45c5c"]}
              />
              <StatCard
                icon={<MdAttachMoney />}
                label="Inventory value"
                value={formatCurrency(metrics.inventoryValue)}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
            </div>

            <div className="admin-dash__charts-row admin-dash__charts-row--2">
              <StatusDonutChart
                data={data?.statusChart || []}
                title="Stock health"
                subtitle="Products by stock status"
                emptyLabel="No inventory details available"
              />
              <InventoryCategoryChart data={data?.categoryBreakdown || []} />
            </div>

            <StockLevelChart data={stockReport} />

            <section className="admin-dash__panel admin-dash__report-table-panel">
              <div className="admin-dash__panel-head">
                <div>
                  <h2 className="admin-dash__panel-title">Stock listing</h2>
                  <p className="admin-dash__panel-desc">Current inventory for filtered products</p>
                </div>
              </div>
              {stockReport.length ? (
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockReport.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.category}</td>
                          <td>{item.stock}</td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${stockBadgeClass(
                                item.status
                              )}`}
                            >
                              {stockLabel(item.status)}
                            </span>
                          </td>
                          <td>{formatCurrency(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-dash__widget-empty">No inventory details available</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
