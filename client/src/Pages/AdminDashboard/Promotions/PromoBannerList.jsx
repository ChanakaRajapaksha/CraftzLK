import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaImage } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoImagesOutline } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { getPromoStatusBadge } from "./promoListHelpers";
import PromoBannerFormModal from "./PromoBannerFormModal";

export default function PromoBannerList() {
  const { setAlertBox } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const loadBanners = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    fetchDataFromApi("/api/home-slider-banners")
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load banners.");
        }
        setBanners(Array.isArray(res?.bannerList) ? res.bannerList : []);
      })
      .catch(() => {
        setBanners([]);
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
      setEditingBannerId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingBannerId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingBannerId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingBannerId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingBannerId(item._id || item.id);
    setModalOpen(true);
  };

  const stats = useMemo(() => {
    const activeCount = banners.filter((b) => b.status === "active").length;
    return {
      total: banners.length,
      activeCount,
      inactiveCount: banners.length - activeCount,
    };
  }, [banners]);

  const filtered = useMemo(() => {
    let list = [...banners];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.heading, item.title, item.description, item.buttonText].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [banners, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.title || item.heading });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);

    deleteData(`/api/home-slider-banners/${id}`)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete banner.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Banner deleted." });
        loadBanners();
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to delete banner." });
      });
  };

  const emptyMessage = loadError
    ? "Unable to load banners. Please try again."
    : filtered.length === 0 && banners.length === 0
      ? "No banners yet. Add your first homepage banner."
      : "No banners match your filters.";

  return (
    <>
      <AdminPageHeader
        title="Banner List"
        subtitle="Manage homepage slider banners."
        breadcrumbs={[{ label: "Promotions & Marketing" }, { label: "Banners" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Banner
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoImagesOutline />} label="Total banners" value={stats.total} />
        <StatCard
          icon={<FaImage />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<FaImage />}
          label="Inactive"
          value={stats.inactiveCount}
          gradient={["#8b7355", "#a89070"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search banners…"
            aria-label="Search banners"
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
          <AdminLoadingState message="Loading banners…" />
        ) : (
          <div className="admin-dash__data-table">
            <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
              <table className="admin-dash__table admin-dash__table--modern admin-dash__table--promo-banners">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Link</th>
                    <th>Order</th>
                    <th>Status</th>
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
                      const img = item.desktopImage || item.mobileImage;
                      const link = item.buttonUrl || item.link || "—";
                      const statusBadge = getPromoStatusBadge(item.status);

                      return (
                        <tr key={id}>
                          <td>
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="admin-dash__table-thumb admin-dash__banner-thumb"
                              />
                            ) : (
                              <div className="admin-dash__product-placeholder admin-dash__table-thumb admin-dash__banner-thumb" />
                            )}
                          </td>
                          <td>
                            <strong>{item.title || item.heading}</strong>
                            {item.buttonText && (
                              <span className="admin-dash__promo-banner-cta">
                                {item.buttonText}
                              </span>
                            )}
                            {item.description && (
                              <span className="admin-dash__promo-banner-desc">
                                {item.description}
                              </span>
                            )}
                          </td>
                          <td className="admin-dash__promo-link-cell">{link}</td>
                          <td>
                            <span className="admin-dash__badge">
                              {item.displayOrder ?? 0}
                            </span>
                          </td>
                          <td>
                            <span className={statusBadge.className}>
                              {statusBadge.label}
                            </span>
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
              itemLabel="banners"
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

      <PromoBannerFormModal
        open={modalOpen}
        bannerId={editingBannerId}
        onClose={closeModal}
        onSaved={loadBanners}
        setAlertBox={setAlertBox}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete banner?"
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
