import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdArticle, MdDelete, MdImage } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getPromoStatusBadge, formatListDate } from "../Promotions/promoListHelpers";
import { getPagePath } from "./cmsFormDefaults";
import { getCmsPageSampleData, isSampleCmsPageId } from "./cmsListUtils";

export default function CmsPageList() {
  const { setAlertBox } = useOutletContext();
  const [pages, setPages] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySample = () => {
    setPages(getCmsPageSampleData());
    setUsingSampleData(true);
  };

  const loadPages = () => {
    fetchDataFromApi("/api/cms-pages")
      .then((res) => {
        const list = res?.pageList || [];
        if (list.length) {
          setPages(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPages();
  }, []);

  const stats = useMemo(() => {
    const activeCount = pages.filter((item) => item.status === "active").length;
    const withImages = pages.filter((item) => (item.images || []).length > 0).length;
    return { total: pages.length, activeCount, withImages };
  }, [pages]);

  const filtered = useMemo(() => {
    let list = [...pages];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.title, item.slug, item.seo?.metaTitle].some((v) =>
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

  const deletePage = (id) => {
    if (usingSampleData || isSampleCmsPageId(id)) {
      setPages((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Page removed from sample list." });
      return;
    }
    deleteData(`/api/cms-pages/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Page deleted." });
      loadPages();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="CMS Pages"
        subtitle="Manage static pages such as About, Contact, Privacy, and Terms."
        breadcrumbs={[{ label: "CMS Pages" }]}
        action={
          <Link to={`${ADMIN_BASE}/cms/pages/add`} className="admin-dash__btn">
            <FaPlus />
            Add Page
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdArticle />} label="Total pages" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdImage />}
          label="With images"
          value={stats.withImages}
          gradient={["#6b5344", "#d4a574"]}
        />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample CMS pages — add or edit live pages via Add Page.
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
                  <th>Slug</th>
                  <th>Path</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No pages match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status === "active" ? "active" : "inactive");
                    return (
                      <tr key={id}>
                        <td><strong>{item.title}</strong></td>
                        <td><code className="admin-dash__slug-code">{item.slug}</code></td>
                        <td className="admin-dash__cms-path-cell">{getPagePath(item.slug)}</td>
                        <td>{(item.images || []).length}</td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>{formatListDate(item.dateUpdated || item.updatedAt)}</td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/cms/pages/edit/${id}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </Link>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                              title="Delete"
                              onClick={() => setDeleteTarget({ id, title: item.title })}
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

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete page?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
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
