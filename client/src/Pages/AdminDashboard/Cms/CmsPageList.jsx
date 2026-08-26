import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { MdArticle, MdDelete, MdImage, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { MyContext } from "../../../App";
import { deleteData, fetchDataFromApi, patchData } from "../../../utils/api";
import { getPromoStatusBadge, formatListDate } from "../Promotions/promoListHelpers";
import { getPagePath, isSystemCmsPage } from "./cmsFormDefaults";
import CmsPageFormModal from "./CmsPageFormModal";

export default function CmsPageList() {
  const { setAlertBox } = useOutletContext();
  const appContext = useContext(MyContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const loadPages = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    fetchDataFromApi("/api/cms-pages")
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load pages.");
        }
        setPages(Array.isArray(res?.pageList) ? res.pageList : []);
      })
      .catch(() => {
        setPages([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const action = searchParams.get("action");

    if (editId) {
      setEditingPageId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingPageId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingPageId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingPageId(null);
    setModalOpen(true);
    setSearchParams({ action: "add" }, { replace: true });
  };

  const openEditModal = (id) => {
    setEditingPageId(id);
    setModalOpen(true);
    setSearchParams({ edit: id }, { replace: true });
  };

  const frontendVisiblePages = useMemo(
    () => pages.filter((item) => item.status === "active"),
    [pages]
  );

  const stats = useMemo(() => {
    const activeCount = pages.filter((item) => item.status === "active").length;
    const withImages = pages.filter((item) => (item.images || []).length > 0).length;
    const navCount = pages.filter((item) => item.status === "active" && item.showInNav !== false).length;
    return { total: pages.length, activeCount, withImages, navCount };
  }, [pages]);

  const filtered = useMemo(() => {
    let list = [...pages];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.title, item.slug, item.seo?.metaTitle, getPagePath(item.slug)].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    return list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }, [pages, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const toggleStatus = (item) => {
    const id = item._id || item.id;
    const nextStatus = item.status === "active" ? "inactive" : "active";
    setStatusUpdatingId(id);

    patchData(`/api/cms-pages/${id}/status`, { status: nextStatus })
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to update page status.",
          });
          return;
        }
        setAlertBox?.({
          open: true,
          error: false,
          msg: nextStatus === "active" ? "Page is now visible on the storefront." : "Page hidden from storefront.",
        });
        loadPages();
        appContext?.refreshCmsNavPages?.();
      })
      .catch((error) => {
        setAlertBox?.({
          open: true,
          error: true,
          msg: error?.response?.data?.message || "Failed to update page status.",
        });
      })
      .finally(() => setStatusUpdatingId(null));
  };

  const deletePage = (id) => {
    deleteData(`/api/cms-pages/${id}`)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({ open: true, error: true, msg: res?.message || "Failed to delete page." });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Page removed from storefront." });
        loadPages();
        appContext?.refreshCmsNavPages?.();
      })
      .catch((error) => {
        setAlertBox?.({
          open: true,
          error: true,
          msg: error?.response?.data?.message || "Failed to delete page.",
        });
      });
  };

  return (
    <>
      <AdminPageHeader
        title="CMS Pages"
        subtitle="Built-in storefront pages (Home, Shop, Categories, Gifts, Eco) plus any custom pages you add."
        breadcrumbs={[{ label: "CMS Pages" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Page
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdArticle />} label="Total pages" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Live on storefront"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdVisibility />}
          label="In header nav"
          value={stats.navCount}
          gradient={["#8b6f47", "#b8860b"]}
        />
        <StatCard
          icon={<MdImage />}
          label="With images"
          value={stats.withImages}
          gradient={["#6b5344", "#d4a574"]}
        />
      </div>

      <section className="admin-dash__panel admin-dash__cms-frontend-panel">
        <div className="admin-dash__panel-head">
          <div>
            <h2 className="admin-dash__panel-title">Visible on frontend</h2>
            <p className="admin-dash__panel-desc">
              Active pages currently published on the storefront and available in navigation.
            </p>
          </div>
        </div>

        {loading ? (
          <AdminLoadingState message="Loading storefront pages…" compact />
        ) : frontendVisiblePages.length === 0 ? (
          <p className="admin-dash__table-empty">No active pages on the storefront yet.</p>
        ) : (
          <div className="admin-dash__cms-frontend-grid">
            {frontendVisiblePages.map((item) => {
              const id = item._id || item.id;
              const pagePath = getPagePath(item);
              const viewHref = item.routePath || item.path;
              return (
                <article key={id} className="admin-dash__cms-frontend-card">
                  <div className="admin-dash__cms-frontend-card-head">
                    <strong>{item.title}</strong>
                    <span className="admin-dash__cms-type-badge admin-dash__cms-type-badge--system">
                      {isSystemCmsPage(item) ? "Built-in" : "Custom"}
                    </span>
                  </div>
                  <p className="admin-dash__cms-frontend-path">{pagePath}</p>
                  {item.isComingSoon ? (
                    <span className="admin-dash__cms-frontend-soon">Coming soon content</span>
                  ) : (
                    <span className="admin-dash__cms-frontend-live">Published content</span>
                  )}
                  {viewHref ? (
                    <a
                      href={viewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-dash__cms-frontend-link"
                    >
                      View page
                      <FaExternalLinkAlt aria-hidden />
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-dash__panel">
        {loadError && (
          <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
            Could not load CMS pages. Check your connection and try again.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search pages…"
            aria-label="Search CMS pages"
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
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--cms">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Slug</th>
                  <th>Path</th>
                  <th>Frontend</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="admin-dash__table-empty">
                      Loading pages…
                    </td>
                  </tr>
                ) : slice.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-dash__table-empty">
                      No pages match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status === "active" ? "active" : "inactive");
                    const pagePath = getPagePath(item);
                    const isSystem = isSystemCmsPage(item);
                    const isUpdating = statusUpdatingId === id;

                    return (
                      <tr key={id}>
                        <td><strong>{item.title}</strong></td>
                        <td>
                          <span className={`admin-dash__cms-type-badge${isSystem ? " admin-dash__cms-type-badge--system" : " admin-dash__cms-type-badge--custom"}`}>
                            {isSystem ? "Built-in" : "Custom"}
                          </span>
                        </td>
                        <td><code className="admin-dash__slug-code">{item.slug}</code></td>
                        <td className="admin-dash__cms-path-cell">{pagePath}</td>
                        <td>
                          {item.status === "active" ? (
                            <span className="admin-dash__cms-frontend-live">Visible</span>
                          ) : (
                            <span className="admin-dash__cms-frontend-hidden">Hidden</span>
                          )}
                        </td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>{formatListDate(item.dateUpdated || item.updatedAt)}</td>
                        <td>
                          <div className="admin-dash__actions">
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title={item.status === "active" ? "Hide from storefront" : "Show on storefront"}
                              disabled={isUpdating}
                              onClick={() => toggleStatus(item)}
                            >
                              {item.status === "active" ? <MdVisibilityOff /> : <MdVisibility />}
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Edit"
                              onClick={() => openEditModal(id)}
                            >
                              <FaPencilAlt />
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                              title={isSystem ? "Built-in pages cannot be deleted" : "Delete"}
                              disabled={isSystem}
                              onClick={() => !isSystem && setDeleteTarget({ id, title: item.title })}
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
            itemLabel="pages"
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

      <CmsPageFormModal
        open={modalOpen}
        pageId={editingPageId}
        onClose={closeModal}
        onSaved={() => {
          loadPages();
          appContext?.refreshCmsNavPages?.();
        }}
        setAlertBox={setAlertBox}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete page?"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from the storefront? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          deletePage(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
