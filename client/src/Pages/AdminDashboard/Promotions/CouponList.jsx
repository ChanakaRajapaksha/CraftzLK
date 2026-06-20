import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaTag } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { formatCouponDiscount, formatUsage } from "./couponFormDefaults";
import { getCouponListSampleData, isSampleCouponId } from "./couponListUtils";
import { formatListDate, getPromoStatusBadge } from "./promoListHelpers";

export default function CouponList() {
  const { setAlertBox } = useOutletContext();
  const [coupons, setCoupons] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySample = () => {
    setCoupons(getCouponListSampleData());
    setUsingSampleData(true);
  };

  const loadCoupons = () => {
    fetchDataFromApi("/api/coupons")
      .then((res) => {
        const list = res?.couponList || [];
        if (list.length) {
          setCoupons(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCoupons();
  }, []);

  const stats = useMemo(() => {
    const activeCount = coupons.filter((item) => item.status === "active").length;
    const expiredCount = coupons.filter((item) => item.status === "expired").length;
    const totalUsage = coupons.reduce((sum, item) => sum + (item.usageCount || 0), 0);
    return { total: coupons.length, activeCount, expiredCount, totalUsage };
  }, [coupons]);

  const filtered = useMemo(() => {
    let list = [...coupons];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) => String(item.code || "").toLowerCase().includes(q));
    }

    if (discountTypeFilter !== "all") {
      list = list.filter((item) => item.discountType === discountTypeFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    return list;
  }, [coupons, searchKeyword, discountTypeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const deleteCoupon = (id) => {
    if (usingSampleData || isSampleCouponId(id)) {
      setCoupons((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Coupon removed from sample list." });
      return;
    }
    deleteData(`/api/coupons/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Coupon deleted." });
      loadCoupons();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.code });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCoupon(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Coupon List"
        subtitle="Manage discount codes for checkout and campaigns."
        breadcrumbs={[{ label: "Promotions & Marketing" }, { label: "Coupons" }]}
        action={
          <Link to={`${ADMIN_BASE}/promotions/coupons/add`} className="admin-dash__btn">
            <FaPlus />
            Add Coupon
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoTicketOutline />} label="Total coupons" value={stats.total} />
        <StatCard icon={<FaTag />} label="Active" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<FaTag />} label="Expired" value={stats.expiredCount} gradient={["#8b7355", "#a89070"]} />
        <StatCard icon={<IoTicketOutline />} label="Redemptions" value={stats.totalUsage} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample coupons — add live coupons via Add Coupon or your API.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search by code…"
            aria-label="Search coupons"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "12rem" }}
            value={discountTypeFilter}
            onChange={(e) => {
              setDiscountTypeFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by discount type"
          >
            <option value="all">All discount types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
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
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--coupons">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Min order</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No coupons match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status);

                    return (
                      <tr key={id}>
                        <td>
                          <strong className="admin-dash__coupon-code">{item.code}</strong>
                          <span className="admin-dash__promo-type-pill">
                            {item.discountType === "fixed" ? "Fixed" : "Percent"}
                          </span>
                        </td>
                        <td><strong>{formatCouponDiscount(item)}</strong></td>
                        <td>
                          <span className="admin-dash__badge">{formatUsage(item)}</span>
                        </td>
                        <td>
                          {item.minOrderValue
                            ? `Rs ${Number(item.minOrderValue).toLocaleString()}`
                            : "—"}
                        </td>
                        <td>{formatListDate(item.expiryDate)}</td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/promotions/coupons/edit/${id}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </Link>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                              onClick={() => requestDelete(item)}
                              title="Delete"
                            >
                              <MdDelete />
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
            itemLabel="coupons"
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

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete coupon?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
