import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdEmail, MdNotifications, MdSms } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import NotificationController from "../../../controllers/notification.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getPromoStatusBadge, formatListDate } from "../Promotions/promoListHelpers";
import {
  getChannelLabel,
  previewTemplateBody,
  truncatePreview,
} from "./notificationFormDefaults";
import { getNotificationTemplateSampleData } from "./notificationListUtils";

export default function NotificationTemplateList() {
  const [templates, setTemplates] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const applySample = () => {
    setTemplates(getNotificationTemplateSampleData());
    setUsingSampleData(true);
  };

  const loadTemplates = () => {
    NotificationController.getTemplates()
      .then((res) => {
        const list = res?.templateList || [];
        if (list.length) {
          setTemplates(list);
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTemplates();
  }, []);

  const stats = useMemo(() => {
    const emailCount = templates.filter((item) => item.channel === "email").length;
    const smsCount = templates.filter((item) => item.channel === "sms").length;
    const activeCount = templates.filter((item) => item.status === "active").length;
    return { total: templates.length, emailCount, smsCount, activeCount };
  }, [templates]);

  const filtered = useMemo(() => {
    let list = [...templates];
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.code, item.subject, item.body].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }
    if (channelFilter !== "all") {
      list = list.filter((item) => item.channel === channelFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    return list;
  }, [templates, searchKeyword, channelFilter, statusFilter]);

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
        subtitle="Manage email and SMS message templates for order updates."
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
        <StatCard icon={<MdEmail />} label="Email" value={stats.emailCount} gradient={["#8b6f47", "#b8860b"]} />
        <StatCard icon={<MdSms />} label="SMS" value={stats.smsCount} gradient={["#6b5344", "#d4a574"]} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample templates — connect the API to load live templates.
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
            style={{ maxWidth: "10rem" }}
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by channel"
          >
            <option value="all">All channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
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
                  <th>Channel</th>
                  <th>Preview</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
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
                      previewTemplateBody(item.body, item.channel)
                    );
                    return (
                      <tr key={id}>
                        <td><strong>{item.name}</strong></td>
                        <td>
                          <span className={`admin-dash__channel-badge admin-dash__channel-badge--${item.channel}`}>
                            {getChannelLabel(item.channel)}
                          </span>
                        </td>
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
