import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaImage } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoImagesOutline } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getPromoBannerListSampleData, isSamplePromoBannerId } from "./promoBannerListUtils";
import { getPromoStatusBadge } from "./promoListHelpers";

export default function PromoBannerList() {
  const { setAlertBox } = useOutletContext();
  const [banners, setBanners] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySample = () => {
    setBanners(getPromoBannerListSampleData());
    setUsingSampleData(true);
  };

  const loadBanners = () => {
    fetchDataFromApi("/api/home-slider-banners")
      .then((res) => {
        const list = res?.bannerList || [];
        if (list.length) {
          setBanners(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBanners();
  }, []);

  const stats = useMemo(() => {
    const activeCount = banners.filter((b) => b.status === "active").length;
    return { total: banners.length, activeCount, inactiveCount: banners.length - activeCount };
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

  const deleteBanner = (id) => {
    if (usingSampleData || isSamplePromoBannerId(id)) {
      setBanners((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Banner removed from sample list." });
      return;
    }
    deleteData(`/api/home-slider-banners/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Banner deleted." });
      loadBanners();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.title || item.heading });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBanner(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Banner List"
        subtitle="Manage homepage slider banners."
        breadcrumbs={[{ label: "Promotions & Marketing" }, { label: "Banners" }]}
        action={
          <Link to={`${ADMIN_BASE}/promotions/banners/add`} className="admin-dash__btn">
            <FaPlus />
            Add Banner
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<IoImagesOutline />} label="Total banners" value={stats.total} />
        <StatCard icon={<FaImage />} label="Active" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<FaImage />} label="Inactive" value={stats.inactiveCount} gradient={["#8b7355", "#a89070"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample homepage banners — publish live banners via Add Banner.
          </p>
        )}

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
                      No banners match your filters.
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
                            <img src={img} alt="" className="admin-dash__table-thumb admin-dash__banner-thumb" />
                          ) : (
                            <div className="admin-dash__product-placeholder admin-dash__table-thumb admin-dash__banner-thumb" />
                          )}
                        </td>
                        <td>
                          <strong>{item.title || item.heading}</strong>
                          {item.buttonText && (
                            <span className="admin-dash__promo-banner-cta">{item.buttonText}</span>
                          )}
                          {item.description && (
                            <span className="admin-dash__promo-banner-desc">{item.description}</span>
                          )}
                        </td>
                        <td className="admin-dash__promo-link-cell">{link}</td>
                        <td>
                          <span className="admin-dash__badge">{item.displayOrder ?? 0}</span>
                        </td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/promotions/banners/edit/${id}`}
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
      </section>

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
