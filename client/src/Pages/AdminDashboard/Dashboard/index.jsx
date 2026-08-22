import { useState } from "react";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import DateRangeFilter from "./components/DateRangeFilter";
import SectionNav from "./components/SectionNav";
import KpiCardGrid from "./components/KpiCardGrid";
import SalesOverviewWidget from "./components/SalesOverviewWidget";
import OrderStatusWidget from "./components/OrderStatusWidget";
import PaymentOverviewWidget from "./components/PaymentOverviewWidget";
import { SalesTrendChart } from "./components/DashboardCharts";
import RecentOrdersTable from "./components/RecentOrdersTable";
import TopSellingProductsWidget from "./components/TopSellingProductsWidget";
import InventoryOverviewWidget from "./components/InventoryOverviewWidget";
import CustomerInsightsWidget from "./components/CustomerInsightsWidget";
import CategoryPerformanceWidget from "./components/CategoryPerformanceWidget";
import useDashboard from "./useDashboard";

export default function AdminDashboardHome() {
  const [datePreset, setDatePreset] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [section, setSection] = useState("overview");

  const { data, loading, loadError } = useDashboard({
    preset: datePreset,
    customStart,
    customEnd,
    metric: chartMetric,
  });

  const comparisonLabel = data?.comparisonLabel || "previous period";
  const kpis = data?.kpis || {
    revenue: { value: 0, change: 0, direction: "flat" },
    orders: { value: 0, change: 0, direction: "flat" },
    profit: { value: 0, change: 0, direction: "flat" },
    profitAvailable: false,
    profitLabel: "Profit",
    period: {
      revenue: 0,
      orderCount: 0,
      avgOrderValue: 0,
      itemsSold: 0,
      completedOrderCount: 0,
      pendingPaymentCount: 0,
    },
  };
  const orderSummary = data?.orderSummary || {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  };
  const productSummary = data?.productSummary || {
    total: 0,
    active: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0,
    draft: 0,
  };
  const customerSummary = data?.customerSummary || {
    totalCustomers: 0,
    newCustomers: 0,
    returningRate: 0,
    periodCustomers: 0,
  };

  const handleCustomDateChange = ({ start, end }) => {
    if (start !== undefined) setCustomStart(start);
    if (end !== undefined) setCustomEnd(end);
  };

  const showSales = section === "overview" || section === "sales";
  const showProducts = section === "overview" || section === "products";

  if (loading && !data) {
    return (
      <div className="admin-dash__loading">
        <div className="admin-dash__loading-spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="CraftzLK Admin"
        title="Dashboard Overview"
        subtitle="Live sales, orders, products, and customer insights"
        action={
          <DateRangeFilter
            value={datePreset}
            onChange={setDatePreset}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={handleCustomDateChange}
          />
        }
      />

      {loadError && (
        <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
          Could not load dashboard data. Check your connection and try again.
        </p>
      )}

      <SectionNav active={section} onChange={setSection} />

      <div className="admin-dash__dashboard-stack">
        <KpiCardGrid
          kpis={kpis}
          productSummary={productSummary}
          customerSummary={customerSummary}
          comparisonLabel={comparisonLabel}
          lowStockProducts={data?.lowStockProducts || []}
        />

        {showSales && (
          <>
            <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
              <SalesOverviewWidget metrics={kpis.period} />
              <OrderStatusWidget
                orderSummary={orderSummary}
                chartData={data?.orderStatusChart || []}
              />
            </div>

            <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
              <PaymentOverviewWidget metrics={kpis.period} />
              <TopSellingProductsWidget products={data?.topProducts || []} />
            </div>

            <SalesTrendChart
              data={data?.salesTrend || []}
              metric={chartMetric}
              onMetricChange={setChartMetric}
              profitMetricLabel={kpis.profitLabel || "Profit"}
            />

            <RecentOrdersTable orders={data?.recentOrders || []} />
          </>
        )}

        {showProducts && (
          <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
            <InventoryOverviewWidget productSummary={productSummary} />
            {section === "overview" && (
              <CustomerInsightsWidget customerSummary={customerSummary} />
            )}
            {section === "products" && (
              <CategoryPerformanceWidget categories={data?.topCategories || []} />
            )}
          </div>
        )}

        {section === "customers" && (
          <CustomerInsightsWidget customerSummary={customerSummary} />
        )}

        {(section === "overview" || section === "customers") && (
          <CategoryPerformanceWidget categories={data?.topCategories || []} />
        )}
      </div>
    </>
  );
}
