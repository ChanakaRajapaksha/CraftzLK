import { formatCurrency, formatPercentChange } from "../dashboardAnalytics";
import LowStockAlertWidget from "./LowStockAlertWidget";

function KpiCard({
  label,
  value,
  change,
  direction,
  comparisonLabel,
  accent,
  format = "currency",
  displayOverride,
}) {
  let displayValue = displayOverride;
  if (displayValue === undefined) {
    displayValue =
      format === "currency"
        ? formatCurrency(value)
        : format === "percent"
          ? `${Math.round(value)}%`
          : value;
  }

  return (
    <div className={`admin-dash__kpi-card admin-dash__kpi-card--${accent}`}>
      <p className="admin-dash__kpi-label">{label}</p>
      <p className="admin-dash__kpi-value">{displayValue}</p>
      {change !== undefined && (
        <p className={`admin-dash__kpi-change admin-dash__kpi-change--${direction}`}>
          <span className="admin-dash__kpi-arrow">
            {direction === "up" ? "↑" : direction === "down" ? "↓" : "•"}
          </span>
          {formatPercentChange(change)}
          <span className="admin-dash__kpi-vs">vs {comparisonLabel}</span>
        </p>
      )}
      {change === undefined && comparisonLabel && (
        <p className="admin-dash__kpi-meta">{comparisonLabel}</p>
      )}
    </div>
  );
}

export default function KpiCardGrid({ kpis, productSummary, customerSummary, comparisonLabel, lowStockProducts }) {
  const profitDisplay = kpis.profitAvailable ? kpis.profit.value : null;

  return (
    <div className="admin-dash__kpi-grid">
      <div className="admin-dash__kpi-row admin-dash__kpi-row--primary">
        <KpiCard
          label="Revenue"
          value={kpis.revenue.value}
          change={kpis.revenue.change}
          direction={kpis.revenue.direction}
          comparisonLabel={comparisonLabel}
          accent="revenue"
        />
        <KpiCard
          label="Paid orders"
          value={kpis.orders.value}
          change={kpis.orders.change}
          direction={kpis.orders.direction}
          comparisonLabel={comparisonLabel}
          accent="orders"
          format="number"
        />
        <KpiCard
          label={kpis.profitLabel || "Profit"}
          value={profitDisplay ?? 0}
          change={kpis.profitAvailable ? kpis.profit.change : undefined}
          direction={kpis.profitAvailable ? kpis.profit.direction : undefined}
          comparisonLabel={
            kpis.profitAvailable ? comparisonLabel : "Add product & shipping costs"
          }
          accent="profit"
          format={kpis.profitAvailable ? "currency" : "text"}
          displayOverride={kpis.profitAvailable ? undefined : "N/A"}
        />
      </div>
      <div className="admin-dash__kpi-row admin-dash__kpi-row--secondary">
        <KpiCard
          label="Products"
          value={productSummary.total}
          comparisonLabel={`${productSummary.active} active`}
          accent="products"
          format="number"
        />
        <KpiCard
          label="Customers"
          value={customerSummary.totalCustomers}
          comparisonLabel={`${customerSummary.periodCustomers} active in period`}
          accent="customers"
          format="number"
        />
        <LowStockAlertWidget products={lowStockProducts} variant="kpi" />
      </div>
    </div>
  );
}
