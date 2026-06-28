import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdShoppingBag } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import ArtisanFormModal from "./ArtisanFormModal";

const DEFAULT_STATS = {
  total: 0,
  activeCount: 0,
  inactiveCount: 0,
  productTotal: 0,
};

export default function ArtisanList() {
  const { setAlertBox } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [artisans, setArtisans] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtisanId, setEditingArtisanId] = useState(null);

  const hasActiveFilters = useMemo(
    () => Boolean(searchKeyword.trim()) || statusFilter !== "all",
    [searchKeyword, statusFilter]
  );

  const loadArtisans = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    const params = new URLSearchParams({
      page: String(page + 1),
      perPage: String(rowsPerPage),
    });

    if (searchKeyword.trim()) params.set("search", searchKeyword.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetchDataFromApi(`/api/artisans/admin/list?${params.toString()}`)
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load artisans.");
        }

        setArtisans(Array.isArray(res?.artisans) ? res.artisans : []);
        setTotalItems(Number(res?.total) || 0);
        setTotalPages(Math.max(1, Number(res?.totalPages) || 1));
        setStats(res?.stats || DEFAULT_STATS);
      })
      .catch(() => {
        setArtisans([]);
        setTotalItems(0);
        setTotalPages(1);
        setStats(DEFAULT_STATS);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, searchKeyword, statusFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const action = searchParams.get("action");

    if (editId) {
      setEditingArtisanId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingArtisanId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingArtisanId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    loadArtisans();
  }, [loadArtisans]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingArtisanId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingArtisanId(item._id || item.id);
    setModalOpen(true);
  };

  const deleteArtisan = (id) => {
    deleteData(`/api/artisans/${id}`)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete artisan.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Artisan deleted." });
        loadArtisans();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || "Failed to delete artisan.";
        setAlertBox?.({ open: true, error: true, msg: message });
      });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteArtisan(deleteTarget.id);
    setDeleteTarget(null);
  };

  const emptyMessage = loadError
    ? "Unable to load artisans. Please try again."
    : hasActiveFilters
      ? "No artisans match your filters."
      : "No artisans yet. Add your first artisan to feature makers on the storefront.";

  return (
    <>
      <AdminPageHeader
        title="Artisan List"
        subtitle="Manage makers and studios featured on your handmade marketplace."
        breadcrumbs={[{ label: "Brand / Artisan" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Artisan
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<HiOutlineUserGroup />} label="Total artisans" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Inactive"
          value={stats.inactiveCount}
          gradient={["#6b5344", "#9a7a6a"]}
        />
        <StatCard
          icon={<MdShoppingBag />}
          label="Linked products"
          value={stats.productTotal}
          gradient={["#a67c52", "#c9a961"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search artisans…"
            aria-label="Search artisans"
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
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--artisans">
              <thead>
                <tr>
                  <th>Profile Image</th>
                  <th>Artisan Name</th>
                  <th>Location</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      <AdminLoadingState message="Loading artisans…" compact />
                    </td>
                  </tr>
                ) : artisans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  artisans.map((item) => {
                    const id = item._id || item.id;
                    const isActive = (item.status || "active") === "active";
                    const profileImage = item.images?.[0];

                    return (
                      <tr key={id}>
                        <td>
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt=""
                              className="admin-dash__table-thumb admin-dash__table-thumb--round"
                            />
                          ) : (
                            <div className="admin-dash__product-placeholder admin-dash__table-thumb admin-dash__table-thumb--round" />
                          )}
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                          {item.bio && (
                            <span className="admin-dash__artisan-list-bio">{item.bio}</span>
                          )}
                        </td>
                        <td>{item.location || "—"}</td>
                        <td>
                          <span className="admin-dash__badge">{item.productCount ?? 0}</span>
                        </td>
                        <td>
                          <span
                            className={`admin-dash__status-badge admin-dash__status-badge--${isActive ? "completed" : "cancelled"}`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
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
            totalItems={totalItems}
            itemLabel="artisans"
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

      <ArtisanFormModal
        open={modalOpen}
        artisanId={editingArtisanId}
        onClose={closeModal}
        onSaved={loadArtisans}
        setAlertBox={setAlertBox}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete artisan?"
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
