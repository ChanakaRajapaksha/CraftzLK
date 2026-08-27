import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { MdPayments, MdReceiptLong } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import PaymentController from "../../../controllers/payment.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getTransactionStatusBadge,
  TRANSACTION_STATUSES,
} from "./paymentUtils";
import { sumTransactionVolume } from "../../../utils/orderFinancialRules";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    PaymentController.getTransactions()
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load transactions.");
        }
        setTransactions(Array.isArray(res?.transactionList) ? res.transactionList : []);
      })
      .catch(() => {
        setTransactions([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTransactions();
  }, [loadTransactions]);

  const stats = useMemo(() => {
    const successCount = transactions.filter((item) => item.status === "success").length;
    const pendingCount = transactions.filter((item) => item.status === "pending").length;
    const volume = sumTransactionVolume(transactions);
    return { total: transactions.length, successCount, pendingCount, volume };
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.transactionId, item.orderId, item.orderLabel, item.paymentMethod].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const emptyMessage = loadError
    ? "Unable to load transactions. Please try again."
    : filtered.length === 0 && transactions.length === 0
      ? "No payment transactions yet. Transactions are created when customers place orders."
      : "No transactions match your filters.";

  return (
    <>
      <AdminPageHeader
        title="Transactions"
        subtitle="View payment activity recorded for customer orders."
        breadcrumbs={[
          { label: "Payment Management", to: `${ADMIN_BASE}/payments/methods` },
          { label: "Transactions" },
        ]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdReceiptLong />} label="Total transactions" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Successful"
          value={stats.successCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdPayments />}
          label="Pending"
          value={stats.pendingCount}
          gradient={["#6b5344", "#d4a574"]}
        />
        <StatCard
          icon={<MdReceiptLong />}
          label="Volume"
          value={formatTransactionAmount(stats.volume)}
          gradient={["#4a5568", "#718096"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search transactions…"
            aria-label="Search transactions"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "10rem" }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by status"
          >
            {TRANSACTION_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <AdminLoadingState message="Loading transactions…" />
        ) : (
          <div className="admin-dash__data-table">
            <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
              <table className="admin-dash__table admin-dash__table--modern admin-dash__table--payments">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-dash__table-empty">
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    slice.map((item) => {
                      const id = item._id || item.id;
                      const statusBadge = getTransactionStatusBadge(item.status);
                      return (
                        <tr key={id}>
                          <td><strong>{item.transactionId || "—"}</strong></td>
                          <td>{item.orderLabel || item.orderId || "—"}</td>
                          <td><strong>{formatTransactionAmount(item.amount, item.currency)}</strong></td>
                          <td>
                            <span className={statusBadge.className}>{statusBadge.label}</span>
                          </td>
                          <td>{formatTransactionDate(item.date)}</td>
                          <td>
                            <div className="admin-dash__actions">
                              <Link
                                to={`${ADMIN_BASE}/orders`}
                                className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                                title="View orders"
                              >
                                <FaEye />
                              </Link>
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
              itemLabel="transactions"
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={setPage}
              onRowsPerPageChange={(value) => {
                setRowsPerPage(value);
                setPage(0);
              }}
            />
          </div>
        )}
      </section>
    </>
  );
}
