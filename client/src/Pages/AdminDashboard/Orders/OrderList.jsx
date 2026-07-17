import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaEye, FaFileDownload, FaPrint, FaSyncAlt } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdPayments, MdLocalShipping } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import DateRangeFilter from "../../../Components/AdminDashboard/DateRangeFilter";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import OrderStatusDialog from "./OrderStatusDialog";
import {
  downloadOrderPdf,
  formatCurrency,
  formatOrderDate,
  getOrderDisplayId,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  getOrderDateRange,
  normalizeOrder,
  ORDER_DATE_PRESETS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  printOrderInvoice,
} from "./orderUtils";

export default function OrderList() {
  const { setAlertBox } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [appliedDatePreset, setAppliedDatePreset] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusTarget, setStatusTarget] = useState(null);
  const [nextStatus, setNextStatus] = useState("confirmed");
  const [savingStatus, setSavingStatus] = useState(false);

  const loadOrders = () => {
    fetchDataFromApi("/api/orders/")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.orderList || [];
        setOrders(list.map(normalizeOrder));
      })
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pending = orders.filter((order) => order.paymentStatus === "pending").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    return { total: orders.length, revenue, pending, delivered };
  }, [orders]);

  const dateRange = useMemo(
    () => getOrderDateRange(appliedDatePreset, customStart, customEnd),
    [appliedDatePreset, customStart, customEnd]
  );

  const filtered = useMemo(() => {
    let list = [...orders];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((order) =>
        [getOrderDisplayId(order), order.name, order.email, order.phoneNumber].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (paymentFilter !== "all") {
      list = list.filter((order) => order.paymentStatus === paymentFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((order) => order.status === statusFilter);
    }

    if (dateRange) {
      list = list.filter((order) => {
        const orderDate = new Date(order.date);
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
      });
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, searchKeyword, paymentFilter, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const openStatusDialog = (order) => {
    setStatusTarget(order);
    setNextStatus(order.status || "confirmed");
  };

  const closeStatusDialog = () => {
    setStatusTarget(null);
  };

  const saveStatus = () => {
    if (!statusTarget) return;

    const id = statusTarget._id || statusTarget.id;

    setSavingStatus(true);
    editData(`/api/orders/${id}`, { status: nextStatus })
      .then((res) => {
        const updated = normalizeOrder(res?.order || res);
        setOrders((prev) =>
          prev.map((order) => ((order._id || order.id) === id ? updated : order))
        );
        closeStatusDialog();
        setAlertBox?.({ open: true, error: false, msg: "Order status updated." });
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update order status." });
      })
      .finally(() => setSavingStatus(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Order List"
        subtitle="Track customer orders, payments, and fulfillment status."
        breadcrumbs={[{ label: "Orders" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoMdCart />} label="Total orders" value={stats.total} />
        <StatCard
          icon={<MdPayments />}
          label="Revenue (Rs)"
          value={stats.revenue.toLocaleString("en-LK")}
          gradient={["#a67c52", "#c9a961"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Delivered"
          value={stats.delivered}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdLocalShipping />}
          label="Pending payment"
          value={stats.pending}
          gradient={["#6b5344", "#9a7a6a"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search order or customer…"
            aria-label="Search orders"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <DateRangeFilter
            presets={ORDER_DATE_PRESETS}
            value={datePreset}
            onChange={setDatePreset}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={({ start, end }) => {
              if (start !== undefined) setCustomStart(start);
              if (end !== undefined) setCustomEnd(end);
            }}
            onApply={(preset) => {
              setAppliedDatePreset(preset || datePreset);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "11rem" }}
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by payment status"
          >
            <option value="all">All payments</option>
            {PAYMENT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <select
            className="admin-dash__select"
            style={{ maxWidth: "11rem" }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by order status"
          >
            <option value="all">All order status</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--orders">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No orders match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((order) => {
                    const id = order._id || order.id;
                    return (
                      <tr key={id}>
                        <td><strong>{getOrderDisplayId(order)}</strong></td>
                        <td>
                          <strong>{order.name}</strong>
                          <span className="admin-dash__order-list-email">{order.email}</span>
                        </td>
                        <td>{formatOrderDate(order.date)}</td>
                        <td><strong>{formatCurrency(order.total)}</strong></td>
                        <td>
                          <span className={`admin-dash__status-badge admin-dash__status-badge--${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-dash__status-badge admin-dash__status-badge--${getOrderStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-dash__actions admin-dash__actions--orders">
                            <Link
                              to={`${ADMIN_BASE}/orders/${id}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="View details"
                            >
                              <FaEye />
                            </Link>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Change status"
                              onClick={() => openStatusDialog(order)}
                            >
                              <FaSyncAlt />
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Print invoice"
                              onClick={() => printOrderInvoice(order)}
                            >
                              <FaPrint />
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Download PDF"
                              onClick={() => downloadOrderPdf(order)}
                            >
                              <FaFileDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemLabel="orders"
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
          />
        </div>
      </section>

      <OrderStatusDialog
        open={Boolean(statusTarget)}
        order={statusTarget}
        value={nextStatus}
        onChange={setNextStatus}
        onConfirm={saveStatus}
        onCancel={closeStatusDialog}
        saving={savingStatus}
      />
    </>
  );
}
