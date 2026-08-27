import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaShippingFast } from "react-icons/fa";
import { MdDelete, MdLocalShipping } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ShippingController from "../../../controllers/shipping.controller.js";
import { formatCost, formatZones } from "./shippingFormDefaults";
import { getPromoStatusBadge } from "../Promotions/promoListHelpers";
import ShippingMethodFormModal from "./ShippingMethodFormModal";

export default function ShippingMethodList() {
  const { setAlertBox } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState(null);

  const loadMethods = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    ShippingController.getList()
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load shipping methods.");
        }
        setMethods(Array.isArray(res?.methodList) ? res.methodList : []);
      })
      .catch(() => {
        setMethods([]);
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
      setEditingMethodId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingMethodId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingMethodId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingMethodId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingMethodId(item._id || item.id);
    setModalOpen(true);
  };

  const stats = useMemo(() => {
    const activeCount = methods.filter((item) => item.status === "active").length;
    const zoneCount = new Set(methods.flatMap((item) => item.zones || [])).size;
    return { total: methods.length, activeCount, zoneCount };
  }, [methods]);

  const filtered = useMemo(() => {
    let list = [...methods];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.deliveryTime, ...(item.zones || [])].some((v) =>
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

  const deleteMethod = (id) => {
    ShippingController.remove(id)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({ open: true, error: true, msg: res?.message || "Failed to delete shipping method." });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Shipping method deleted." });
        loadMethods();
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to delete shipping method." });
      });
  };

  const emptyMessage = loadError
    ? "Unable to load shipping methods. Please try again."
    : filtered.length === 0 && methods.length === 0
      ? "No shipping methods yet. Add your first delivery option."
      : "No shipping methods match your filters.";

  return (
    <>
      <AdminPageHeader
        title="Shipping Methods"
        subtitle="Configure delivery options, costs, and zones for checkout."
        breadcrumbs={[{ label: "Shipping Management" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Method
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdLocalShipping />} label="Total methods" value={stats.total} />
        <StatCard icon={<IoShieldCheckmarkSharp />} label="Active" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<FaShippingFast />} label="Zones covered" value={stats.zoneCount} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search methods…"
            aria-label="Search shipping methods"
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

        {loading ? (
          <AdminLoadingState message="Loading shipping methods…" />
        ) : (
          <div className="admin-dash__data-table">
            <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
              <table className="admin-dash__table admin-dash__table--modern admin-dash__table--shipping">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Customer cost</th>
                    <th>Actual shipping cost</th>
                    <th>Delivery time</th>
                    <th>Shipping zones</th>
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
                      const statusBadge = getPromoStatusBadge(item.status === "active" ? "active" : "inactive");
                      return (
                        <tr key={id}>
                          <td><strong>{item.name}</strong></td>
                          <td><strong>{formatCost(item.cost)}</strong></td>
                          <td>{formatCost(item.actualShippingCost)}</td>
                          <td>{item.deliveryTime || "—"}</td>
                          <td className="admin-dash__shipping-zones-cell">{formatZones(item.zones)}</td>
                          <td>
                            <span className={statusBadge.className}>{statusBadge.label}</span>
                          </td>
                          <td>
                            <div className="admin-dash__actions">
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                                title="Edit"
                                onClick={() => openEditModal(item)}
                              >
                                <FaPencilAlt />
                              </button>
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                                title="Delete"
                                onClick={() => setDeleteTarget({ id, name: item.name })}
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
        )}
      </section>

      <ShippingMethodFormModal
        open={modalOpen}
        methodId={editingMethodId}
        onClose={closeModal}
        onSaved={loadMethods}
        setAlertBox={setAlertBox}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete shipping method?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          deleteMethod(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
