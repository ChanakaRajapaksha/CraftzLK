import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdEmail, MdNotifications } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import NotificationController from "../../../controllers/notification.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getPromoStatusBadge, formatListDate } from "../Promotions/promoListHelpers";
import {
  getCategoryLabel,
  previewTemplateBody,
  truncatePreview,
  TEMPLATE_CATEGORIES,
} from "./notificationFormDefaults";

export default function NotificationTemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadTemplates = () => {
    setLoading(true);
    setLoadError("");
    NotificationController.getTemplates()
      .then((res) => {
        setTemplates(res?.templateList || []);
      })
      .catch(() => {
        setTemplates([]);
        setLoadError("Failed to load notification templates.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTemplates();
  }, []);

  const stats = useMemo(() => {
    const activeCount = templates.filter((item) => item.status === "active").length;
    return { total: templates.length, activeCount };
  }, [templates]);

  const filtered = useMemo(() => {
    let list = [...templates];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.code, item.subject, item.body, item.description, item.category].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((item) => (item.category || "general") === categoryFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    return list.sort((a, b) => {
      const categoryCompare = String(a.category || "").localeCompare(String(b.category || ""));
      if (categoryCompare !== 0) return categoryCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [templates, searchKeyword, categoryFilter, statusFilter]);

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
        title="Notification Templates"
        subtitle="View and edit email templates used across the store."
        breadcrumbs={[
          { label: "Notification Management", to: `${ADMIN_BASE}/notifications` },
          { label: "Templates" },
        ]}
        action={
          <Link to={`${ADMIN_BASE}/notifications`} className="admin-dash__btn admin-dash__btn--ghost">
            Channel settings
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdNotifications />} label="Total templates" value={stats.total} />
        <StatCard icon={<MdEmail />} label="Email templates" value={stats.total} gradient={["#8b6f47", "#b8860b"]} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
      </div>

      <section className="admin-dash__panel">
        {loadError && (
          <p className="admin-dash__sample-banner admin-dash__sample-banner--error">
            {loadError}
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search templates…"
            aria-label="Search templates"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "11rem" }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by category"
          >
            {TEMPLATE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
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
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--notifications">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Category</th>
                  <th>Preview</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      Loading templates…
                    </td>
                  </tr>
                ) : slice.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      No templates match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const statusBadge = getPromoStatusBadge(item.status === "active" ? "active" : "inactive");
                    const preview = truncatePreview(
                      previewTemplateBody(item.body, "email", item.subject)
                    );
                    return (
                      <tr key={id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{getCategoryLabel(item.category)}</td>
                        <td className="admin-dash__notification-preview-cell" title={preview}>
                          {preview}
                        </td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>{formatListDate(item.dateUpdated || item.updatedAt)}</td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/notifications/templates/edit/${id}`}
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
            itemLabel="templates"
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
