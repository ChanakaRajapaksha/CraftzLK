import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaTag } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import CouponController from "../../../controllers/coupon.controller.js";
import { formatCouponDiscount, formatUsage } from "./couponFormDefaults";
import { formatListDate, getPromoStatusBadge } from "./promoListHelpers";
import CouponFormModal from "./CouponFormModal";

export default function CouponList() {
  const { setAlertBox } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);

  const loadCoupons = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    CouponController.getList()
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load coupons.");
        }
        setCoupons(Array.isArray(res?.couponList) ? res.couponList : []);
      })
      .catch(() => {
        setCoupons([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const action = searchParams.get("action");

    if (editId) {
      setEditingCouponId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingCouponId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingCouponId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingCouponId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingCouponId(item._id || item.id);
    setModalOpen(true);
  };

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
    CouponController.remove(id)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete coupon.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Coupon deleted." });
        loadCoupons();
      })
      .catch((error) => {
        const message = error?.response?.data?.message || "Failed to delete coupon.";
        setAlertBox?.({ open: true, error: true, msg: message });
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

  const emptyMessage = loadError
    ? "Unable to load coupons. Please try again."
    : filtered.length === 0 && coupons.length === 0
      ? "No coupons yet. Add your first discount code."
      : "No coupons match your filters.";

  return (
    <>
      <AdminPageHeader
        title="Coupon List"
        subtitle="Manage discount codes for checkout and campaigns."
        breadcrumbs={[{ label: "Promotions & Marketing" }, { label: "Coupons" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Coupon
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoTicketOutline />} label="Total coupons" value={stats.total} />
        <StatCard icon={<FaTag />} label="Active" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<FaTag />} label="Expired" value={stats.expiredCount} gradient={["#8b7355", "#a89070"]} />
        <StatCard icon={<IoTicketOutline />} label="Redemptions" value={stats.totalUsage} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
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

        {loading ? (
          <AdminLoadingState message="Loading coupons…" />
        ) : (
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
                        {emptyMessage}
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
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                                onClick={() => openEditModal(item)}
                                title="Edit"
                              >
                                <FaPencilAlt />
                              </button>
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
        )}
      </section>

      <CouponFormModal
        open={modalOpen}
        couponId={editingCouponId}
        onClose={closeModal}
        onSaved={loadCoupons}
        setAlertBox={setAlertBox}
      />

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
