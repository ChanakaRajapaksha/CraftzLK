import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaPercent } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoPricetagOutline } from "react-icons/io5";
import { MdCategory, MdLayers } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  formatDiscountTarget,
  formatDiscountType,
  formatDiscountValue,
  DISCOUNT_TYPES,
} from "./discountFormDefaults";
import { getDiscountListSampleData, isSampleDiscountId } from "./discountListUtils";
import { formatListDate, getPromoStatusBadge } from "./promoListHelpers";

export default function DiscountList() {
  const { setAlertBox } = useOutletContext();
  const [discounts, setDiscounts] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySample = () => {
    setDiscounts(getDiscountListSampleData());
    setUsingSampleData(true);
  };

  const loadDiscounts = () => {
    fetchDataFromApi("/api/promo-discounts")
      .then((res) => {
        const list = res?.discountList || [];
        if (list.length) {
          setDiscounts(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDiscounts();
  }, []);

  const stats = useMemo(() => {
    const byType = DISCOUNT_TYPES.reduce((acc, t) => {
      acc[t.value] = discounts.filter((d) => d.type === t.value).length;
      return acc;
    }, {});
    const activeCount = discounts.filter((d) => d.status === "active").length;
    return { total: discounts.length, activeCount, ...byType };
  }, [discounts]);

  const filtered = useMemo(() => {
    let list = [...discounts];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.categoryName, item.description].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (typeFilter !== "all") list = list.filter((item) => item.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((item) => item.status === statusFilter);

    return list;
  }, [discounts, searchKeyword, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const deleteDiscount = (id) => {
    if (usingSampleData || isSampleDiscountId(id)) {
      setDiscounts((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Discount removed from sample list." });
      return;
    }
    deleteData(`/api/promo-discounts/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Discount deleted." });
      loadDiscounts();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteDiscount(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Discounts"
        subtitle="Create product, category, and seasonal sale promotions."
        breadcrumbs={[{ label: "Promotions & Marketing" }, { label: "Discounts" }]}
        action={
          <Link to={`${ADMIN_BASE}/promotions/discounts/add`} className="admin-dash__btn">
            <FaPlus />
            Create Discount
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoPricetagOutline />} label="Total discounts" value={stats.total} />
        <StatCard icon={<FaPercent />} label="Active" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<MdCategory />} label="Product" value={stats.product || 0} gradient={["#8b6f47", "#b8860b"]} />
        <StatCard icon={<MdLayers />} label="Seasonal" value={stats.seasonal || 0} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample discounts — create live promotions via Create Discount.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search discounts…"
            aria-label="Search discounts"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "12rem" }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by discount type"
          >
            <option value="all">All types</option>
            {DISCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
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
            <option value="scheduled">Scheduled</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          {DISCOUNT_TYPES.map((type) => (
            <Link
              key={type.value}
              to={`${ADMIN_BASE}/promotions/discounts/add?type=${type.value}`}
              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
            >
              {type.label}
            </Link>
          ))}
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--discounts">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Target</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No discounts match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status);

                    return (
                      <tr key={id}>
                        <td><strong>{item.name}</strong></td>
                        <td>
                          <span className="admin-dash__promo-type-pill">
                            {formatDiscountType(item.type)}
                          </span>
                        </td>
                        <td><strong>{formatDiscountValue(item)}</strong></td>
                        <td>{formatDiscountTarget(item)}</td>
                        <td>
                          {formatListDate(item.startDate)}
                          {" – "}
                          {formatListDate(item.endDate)}
                        </td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/promotions/discounts/edit/${id}`}
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
            itemLabel="discounts"
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
        title="Delete discount?"
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
