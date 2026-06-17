import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import DateRangeFilter from "./components/DateRangeFilter";
import SectionNav from "./components/SectionNav";
import KpiCardGrid from "./components/KpiCardGrid";
import SalesOverviewWidget from "./components/SalesOverviewWidget";
import OrderStatusWidget from "./components/OrderStatusWidget";
import { SalesTrendChart } from "./components/DashboardCharts";
import RecentOrdersTable from "./components/RecentOrdersTable";
import TopSellingProductsWidget from "./components/TopSellingProductsWidget";
import InventoryOverviewWidget from "./components/InventoryOverviewWidget";
import CustomerInsightsWidget from "./components/CustomerInsightsWidget";
import CategoryPerformanceWidget from "./components/CategoryPerformanceWidget";
import {
  buildKpiComparisons,
  buildOrderStatusChart,
  buildRecentOrders,
  buildSalesTrendComparison,
  buildTopCategories,
  buildTopProducts,
  computeCustomerSummary,
  computeOrderSummary,
  computeProductSummary,
  getComparisonLabel,
  getDateRange,
  getLowStockProducts,
} from "./dashboardAnalytics";
import { getDashboardSampleData } from "./dashboardSampleData";

export default function AdminDashboardHome() {
  const [datePreset, setDatePreset] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [catData, setCatData] = useState({ categoryList: [] });
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    const timer = setTimeout(() => {
      const sample = getDashboardSampleData();
      setOrders(sample.orders);
      setProducts(sample.products);
      setCatData(sample.catData);
      setTotalCustomers(sample.totalCustomers);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const dateRange = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [datePreset, customStart, customEnd]
  );

  const comparisonLabel = useMemo(() => getComparisonLabel(datePreset), [datePreset]);

  const kpis = useMemo(
    () => buildKpiComparisons(orders, datePreset, customStart, customEnd),
    [orders, datePreset, customStart, customEnd]
  );

  const orderSummary = useMemo(
    () => computeOrderSummary(orders, dateRange.start, dateRange.end),
    [orders, dateRange]
  );

  const productSummary = useMemo(() => computeProductSummary(products), [products]);

  const customerSummary = useMemo(
    () => computeCustomerSummary(orders, totalCustomers, dateRange.start, dateRange.end),
    [orders, totalCustomers, dateRange]
  );

  const orderStatusData = useMemo(() => buildOrderStatusChart(orderSummary), [orderSummary]);

  const salesTrendData = useMemo(
    () => buildSalesTrendComparison(orders, chartMetric),
    [orders, chartMetric]
  );

  const recentOrders = useMemo(
    () => buildRecentOrders(orders, 5, dateRange.start, dateRange.end),
    [orders, dateRange]
  );

  const topProducts = useMemo(
    () => buildTopProducts(orders, products, 5, dateRange.start, dateRange.end),
    [orders, products, dateRange]
  );

  const topCategories = useMemo(
    () => buildTopCategories(orders, catData, 5, dateRange.start, dateRange.end),
    [orders, catData, dateRange]
  );

  const lowStockProducts = useMemo(() => getLowStockProducts(products, 5), [products]);

  const handleCustomDateChange = ({ start, end }) => {
    if (start !== undefined) setCustomStart(start);
    if (end !== undefined) setCustomEnd(end);
  };

  const showSales = section === "overview" || section === "sales";
  const showProducts = section === "overview" || section === "products";

  if (loading) {
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
        subtitle="Monitor sales, orders, products, and customers"
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

      <SectionNav active={section} onChange={setSection} />

      <div className="admin-dash__dashboard-stack">
        <KpiCardGrid
          kpis={kpis}
          productSummary={productSummary}
          customerSummary={customerSummary}
          comparisonLabel={comparisonLabel}
          lowStockProducts={lowStockProducts}
        />

        {showSales && (
          <>
            <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
              <SalesOverviewWidget metrics={kpis.period} />
              <OrderStatusWidget orderSummary={orderSummary} chartData={orderStatusData} />
            </div>

            <SalesTrendChart
              data={salesTrendData}
              metric={chartMetric}
              onMetricChange={setChartMetric}
            />

            <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
              <RecentOrdersTable orders={recentOrders} />
              <TopSellingProductsWidget products={topProducts} />
            </div>
          </>
        )}

        {showProducts && (
          <div className="admin-dash__dashboard-row admin-dash__dashboard-row--2">
            <InventoryOverviewWidget productSummary={productSummary} />
            {section === "overview" && <CustomerInsightsWidget customerSummary={customerSummary} />}
            {section === "products" && <CategoryPerformanceWidget categories={topCategories} />}
          </div>
        )}

        {section === "customers" && <CustomerInsightsWidget customerSummary={customerSummary} />}

        {(section === "overview" || section === "customers") && (
          <CategoryPerformanceWidget categories={topCategories} />
        )}
      </div>
    </>
  );
}
