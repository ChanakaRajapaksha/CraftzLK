import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaShoppingCart,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
  FaBox,
  FaBoxOpen,
  FaExclamationTriangle,
  FaFileAlt,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import DashboardTabs from "./components/DashboardTabs";
import MetricWidgetGrid from "./components/MetricWidgetGrid";
import {
  RevenueChartPanel,
  OrderStatusChart,
  TopProductsChart,
  TopCategoriesChart,
  CustomerGrowthChart,
} from "./components/DashboardCharts";
import TopProductsTable from "./components/TopProductsTable";
import RecentActivityFeed from "./components/RecentActivityFeed";
import {
  buildCustomerGrowth,
  buildOrderStatusChart,
  buildRecentActivities,
  buildRevenueChartData,
  buildTopCategories,
  buildTopProducts,
  computeCustomerSummary,
  computeOrderSummary,
  computeProductSummary,
  computeSalesSummary,
  formatCurrency,
} from "./dashboardAnalytics";
import { getDashboardSampleData } from "./dashboardSampleData";

export default function AdminDashboardHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";
  const [tab, setTab] = useState(["home", "sales", "performance"].includes(initialTab) ? initialTab : "home");
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [catData, setCatData] = useState({ categoryList: [] });
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    const timer = setTimeout(() => {
      const sample = getDashboardSampleData();
      setOrders(sample.orders);
      setProducts(sample.products);
      setCatData(sample.catData);
      setTotalCustomers(sample.totalCustomers);
      setTotalReviews(sample.totalReviews);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (next) => {
    setTab(next);
    if (next === "home") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: next });
    }
  };

  useEffect(() => {
    const q = searchParams.get("tab");
    if (q && ["home", "sales", "performance"].includes(q)) {
      setTab(q);
    } else if (!q) {
      setTab("home");
    }
  }, [searchParams]);

  const sales = useMemo(() => computeSalesSummary(orders), [orders]);
  const orderSummary = useMemo(() => computeOrderSummary(orders), [orders]);
  const productSummary = useMemo(() => computeProductSummary(products), [products]);
  const customerSummary = useMemo(
    () => computeCustomerSummary(orders, totalCustomers),
    [orders, totalCustomers]
  );

  const revenueData = useMemo(
    () => buildRevenueChartData(orders, revenuePeriod),
    [orders, revenuePeriod]
  );
  const orderStatusData = useMemo(() => buildOrderStatusChart(orderSummary), [orderSummary]);
  const topProductsChart = useMemo(() => buildTopProducts(orders, products, 6), [orders, products]);
  const topCategories = useMemo(() => buildTopCategories(orders, catData, 6), [orders, catData]);
  const customerGrowth = useMemo(() => buildCustomerGrowth(orders), [orders]);
  const activities = useMemo(
    () => buildRecentActivities(orders, products, totalReviews),
    [orders, products, totalReviews]
  );

  const tableProducts = useMemo(() => {
    const top = buildTopProducts(orders, products, 8);
    const byId = new Map(products.map((p) => [p.id || p._id, p]));
    return top.map((t) => {
      const p = byId.get(t.id) || products.find((x) => x.name === t.name) || {};
      return {
        ...t,
        productId: p.id || p._id || t.id,
        catName: p.catName,
        stock: p.countInStock,
        price: p.price,
        rating: p.rating,
      };
    });
  }, [orders, products]);

  const salesWidgets = [
    { icon: <FaCalendarDay />, label: "Today Sales", value: formatCurrency(sales.todaySales), gradient: ["#8b6f47", "#b8860b"] },
    { icon: <FaCalendarDay />, label: "Yesterday Sales", value: formatCurrency(sales.yesterdaySales), gradient: ["#7a6348", "#a67c52"] },
    { icon: <FaCalendarWeek />, label: "This Week", value: formatCurrency(sales.weekSales), gradient: ["#6b5344", "#c9a961"] },
    { icon: <FaCalendarAlt />, label: "This Month", value: formatCurrency(sales.monthSales), gradient: ["#8b6f47", "#d4a574"] },
    { icon: <FaMoneyBillWave />, label: "Total Revenue", value: formatCurrency(sales.totalRevenue), gradient: ["#b8860b", "#daa520"] },
    { icon: <FaReceipt />, label: "Avg Order Value", value: formatCurrency(sales.avgOrderValue), gradient: ["#6b5344", "#b8860b"] },
  ];

  const orderWidgets = [
    { icon: <FaShoppingCart />, label: "Total Orders", value: orderSummary.total, gradient: ["#8b6f47", "#b8860b"] },
    { icon: <FaChartLine />, label: "Pending", value: orderSummary.pending, gradient: ["#a67c52", "#d4a574"] },
    { icon: <FaCog />, label: "Processing", value: orderSummary.processing, gradient: ["#7a6348", "#c9a961"] },
    { icon: <FaCheckCircle />, label: "Completed", value: orderSummary.completed, gradient: ["#5a7a5e", "#6b8f71"] },
    { icon: <FaTimesCircle />, label: "Cancelled", value: orderSummary.cancelled, gradient: ["#a04545", "#c45c5c"] },
    { icon: <FaUndo />, label: "Returned", value: orderSummary.returned, gradient: ["#7a6a58", "#9a8b78"] },
  ];

  const productWidgets = [
    { icon: <FaBox />, label: "Total Products", value: productSummary.total, gradient: ["#8b6f47", "#b8860b"] },
    { icon: <FaBoxOpen />, label: "Active", value: productSummary.active, gradient: ["#5a7a5e", "#6b8f71"] },
    { icon: <FaTimesCircle />, label: "Out of Stock", value: productSummary.outOfStock, gradient: ["#a04545", "#c45c5c"] },
    { icon: <FaExclamationTriangle />, label: "Low Stock", value: productSummary.lowStock, gradient: ["#a67c52", "#d4a574"] },
    { icon: <FaFileAlt />, label: "Draft", value: productSummary.draft, gradient: ["#7a6a58", "#9a8b78"] },
  ];

  const customerWidgets = [
    { icon: <FaUsers />, label: "Total Customers", value: customerSummary.totalCustomers, gradient: ["#8b6f47", "#b8860b"] },
    { icon: <FaUserPlus />, label: "New Customers", value: customerSummary.newCustomers, gradient: ["#6b5344", "#c9a961"] },
    { icon: <FaUserCheck />, label: "Returning", value: customerSummary.returningCustomers, gradient: ["#5a7a5e", "#6b8f71"] },
  ];

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
        subtitle="Monitor sales, orders, products, and customers in one place."
      />

      <div className="admin-dash__hero-stats">
        <StatCard
          icon={<MdTrendingUp />}
          label="Store revenue"
          value={formatCurrency(sales.totalRevenue)}
          gradient={["#b8860b", "#daa520"]}
        />
        <StatCard
          icon={<FaShoppingCart />}
          label="Total orders"
          value={orderSummary.total}
          gradient={["#8b6f47", "#c9a961"]}
        />
        <StatCard
          icon={<FaBox />}
          label="Active products"
          value={productSummary.active}
          gradient={["#6b5344", "#d4a574"]}
        />
        <StatCard
          icon={<FaUsers />}
          label="Customers"
          value={customerSummary.totalCustomers}
          gradient={["#5a7a5e", "#8b6f47"]}
        />
      </div>

      <DashboardTabs active={tab} onChange={handleTabChange} />

      {tab === "home" && (
        <div className="admin-dash__tab-content">
          <MetricWidgetGrid title="Sales Summary" subtitle="Revenue snapshots" widgets={salesWidgets} />
          <MetricWidgetGrid title="Order Summary" subtitle="Fulfillment pipeline" widgets={orderWidgets} />
          <MetricWidgetGrid title="Product Summary" subtitle="Inventory health" widgets={productWidgets} />
          <MetricWidgetGrid title="Customer Summary" subtitle="Audience insights" widgets={customerWidgets} />

          <div className="admin-dash__charts-row admin-dash__charts-row--2">
            <RevenueChartPanel data={revenueData} period={revenuePeriod} onPeriodChange={setRevenuePeriod} />
            <OrderStatusChart data={orderStatusData} />
          </div>

          <div className="admin-dash__layout-split">
            <TopProductsTable products={tableProducts} />
            <RecentActivityFeed activities={activities} />
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div className="admin-dash__tab-content">
          <MetricWidgetGrid title="Sales Analytics" subtitle="Key revenue metrics" widgets={salesWidgets} />
          <RevenueChartPanel data={revenueData} period={revenuePeriod} onPeriodChange={setRevenuePeriod} />
          <div className="admin-dash__charts-row admin-dash__charts-row--2">
            <TopProductsChart data={topProductsChart} />
            <TopCategoriesChart data={topCategories} />
          </div>
        </div>
      )}

      {tab === "performance" && (
        <div className="admin-dash__tab-content">
          <MetricWidgetGrid title="Store Performance" subtitle="Operations overview" widgets={orderWidgets} />
          <div className="admin-dash__charts-row admin-dash__charts-row--2">
            <OrderStatusChart data={orderStatusData} />
            <CustomerGrowthChart data={customerGrowth} />
          </div>
          <div className="admin-dash__charts-row admin-dash__charts-row--2">
            <TopProductsChart data={topProductsChart} />
            <TopCategoriesChart data={topCategories} />
          </div>
          <TopProductsTable products={tableProducts} />
        </div>
      )}
    </>
  );
}
