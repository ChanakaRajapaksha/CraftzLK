import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdAccountBalance, MdPayments } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import PaymentController from "../../../controllers/payment.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getMethodCodeLabel } from "./paymentFormDefaults";
import { getPaymentMethodSampleData } from "./paymentListUtils";
import { getPromoStatusBadge } from "../Promotions/promoListHelpers";

export default function PaymentMethodList() {
  const [methods, setMethods] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const applySample = () => {
    setMethods(getPaymentMethodSampleData());
    setUsingSampleData(true);
  };

  const loadMethods = () => {
    PaymentController.getMethods()
      .then((res) => {
        const list = res?.methodList || [];
        if (list.length) {
          setMethods(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadMethods();
  }, []);

  const stats = useMemo(() => {
    const activeCount = methods.filter((item) => item.status === "active").length;
    return { total: methods.length, activeCount };
  }, [methods]);

  const filtered = useMemo(() => {
    let list = [...methods];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.code, item.description, item.bankName].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    return list;
  }, [methods, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  return (
    <>
      <AdminPageHeader
        title="Payment Methods"
        subtitle="Manage Cash on Delivery and Bank Transfer options for checkout."
        breadcrumbs={[{ label: "Payment Management" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdPayments />} label="Total methods" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdAccountBalance />}
          label="Bank transfer"
          value={methods.some((item) => item.code === "bank_transfer" && item.status === "active") ? "On" : "Off"}
          gradient={["#6b5344", "#d4a574"]}
        />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample payment methods — connect the API to load live settings.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search methods…"
            aria-label="Search payment methods"
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
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--payments">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-dash__table-empty">
                      No payment methods match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status === "active" ? "active" : "inactive");
                    const details =
                      item.code === "bank_transfer" && item.accountNumber
                        ? `${item.bankName || "Bank"} · ${item.accountNumber}`
                        : item.description || "—";

                    return (
                      <tr key={id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{getMethodCodeLabel(item.code)}</td>
                        <td className="admin-dash__payment-details-cell">{details}</td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/payments/methods/edit/${id}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Edit"
                            >
                              <FaPencilAlt />
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
            itemLabel="methods"
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
    </>
  );
}
