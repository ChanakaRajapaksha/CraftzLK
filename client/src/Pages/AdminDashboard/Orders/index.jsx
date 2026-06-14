import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import SalesChart from "../../../Components/AdminDashboard/SalesChart";
import { IoMdCart } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { deleteData, fetchDataFromApi } from "../../../utils/api";

export default function AdminOrders() {
  const { setAlertBox } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  const load = () => {
    fetchDataFromApi("/api/orders/").then((res) => {
      const list = Array.isArray(res) ? res : [];
      setOrders(list);
      let sales = 0;
      list.forEach((item) => {
        sales += parseInt(item.amount, 10) || 0;
      });
      setTotalSales(sales);
    });
    fetchDataFromApi("/api/orders/get/count").then((res) => setTotalOrders(res?.orderCount ?? 0));
    fetchDataFromApi("/api/orders/sales").then((res) => {
      const sales = [];
      if (res?.monthlySales?.length) {
        res.monthlySales.forEach((item) =>
          sales.push({ name: item?.month, sales: parseInt(item?.sale, 10) || 0 })
        );
      }
      setSalesData(sales);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, []);

  const deleteOrder = (id) => {
    deleteData(`/api/orders/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Order deleted." });
      load();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Orders"
        subtitle="Manage customer orders and view sales trends."
        breadcrumbs={[{ label: "Orders" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoMdCart />} label="Total orders" value={totalOrders} />
        <StatCard icon={<IoMdCart />} label="Total sales (Rs)" value={totalSales.toLocaleString()} gradient={["#a67c52", "#c9a961"]} />
      </div>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Sales trend</h2>
        <SalesChart data={salesData} type="line" />
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">All orders</h2>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id || order.id}>
                  <td>{order._id || order.id}</td>
                  <td>{order.user?.name || order.name || order.email || "—"}</td>
                  <td>Rs {order.amount}</td>
                  <td>
                    <span className="admin-dash__badge">{order.status || "pending"}</span>
                  </td>
                  <td>{order.dateOrdered ? new Date(order.dateOrdered).toLocaleDateString() : "—"}</td>
                  <td>
                    <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteOrder(order._id || order.id)}>
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
