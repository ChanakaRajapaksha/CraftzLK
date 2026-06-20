import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaCheck, FaStar, FaTimes } from "react-icons/fa";
import { MdDelete, MdRateReview } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import {
  formatReviewDate,
  getReviewStatusBadgeClass,
  normalizeReview,
  REVIEW_STATUSES,
} from "./reviewUtils";
import { getReviewListSampleData, isSampleReviewId } from "./reviewListUtils";

function truncateComment(text, max = 72) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export default function ReviewList() {
  const { setAlertBox } = useOutletContext();
  const [reviews, setReviews] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showAlert = (error, msg) => {
    setAlertBox?.({ open: true, error, msg });
  };

  const applySample = () => {
    setReviews(getReviewListSampleData().map(normalizeReview));
    setUsingSampleData(true);
  };

  const loadReviews = () => {
    fetchDataFromApi("/api/productReviews")
      .then((res) => {
        const list = res?.reviewList || (Array.isArray(res) ? res : []);
        if (list.length) {
          setReviews(list.map(normalizeReview));
          setUsingSampleData(false);
        } else {
          applySample();
        }
      })
      .catch(() => applySample());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const pendingCount = reviews.filter((item) => item.status === "pending").length;
    const approvedCount = reviews.filter((item) => item.status === "approved").length;
    const rejectedCount = reviews.filter((item) => item.status === "rejected").length;
    const avgRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / reviews.length;
    return {
      total: reviews.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      avgRating: avgRating.toFixed(1),
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = [...reviews];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.customerName, item.productName, item.review, item.comment].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    if (ratingFilter !== "all") {
      list = list.filter((item) => Number(item.rating) === Number(ratingFilter));
    }

    return list.sort(
      (a, b) => new Date(b.dateCreated || b.date) - new Date(a.dateCreated || a.date)
    );
  }, [reviews, searchKeyword, statusFilter, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const updateReviewStatus = (id, status) => {
    if (usingSampleData || isSampleReviewId(id)) {
      setReviews((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? { ...item, status } : item))
      );
      showAlert(false, `Review ${status}.`);
      return;
    }

    editData(`/api/productReviews/${id}/status`, { status })
      .then((res) => {
        const updated = normalizeReview(res);
        setReviews((prev) =>
          prev.map((item) => ((item._id || item.id) === id ? updated : item))
        );
        showAlert(false, `Review ${status}.`);
      })
      .catch(() => showAlert(true, "Failed to update review status."));
  };

  const deleteReview = (id) => {
    if (usingSampleData || isSampleReviewId(id)) {
      setReviews((prev) => prev.filter((item) => (item._id || item.id) !== id));
      showAlert(false, "Review removed from sample list.");
      return;
    }

    deleteData(`/api/productReviews/${id}`).then(() => {
      showAlert(false, "Review deleted.");
      loadReviews();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({
      id: item._id || item.id,
      label: `${item.customerName} on ${item.productName}`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteReview(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Reviews List"
        subtitle="Moderate customer product reviews before they appear on the storefront."
        breadcrumbs={[{ label: "Review Management" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdRateReview />} label="Total reviews" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Pending"
          value={stats.pendingCount}
          gradient={["#a67c52", "#c9a961"]}
        />
        <StatCard
          icon={<FaCheck />}
          label="Approved"
          value={stats.approvedCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard icon={<FaStar />} label="Avg rating" value={stats.avgRating} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample reviews — connect live data when customers submit reviews via the storefront.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search reviews…"
            aria-label="Search reviews"
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
            {REVIEW_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <select
            className="admin-dash__select"
            style={{ maxWidth: "10rem" }}
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by rating"
          >
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value} stars</option>
            ))}
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reviews">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No reviews match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const comment = item.comment || item.review;

                    return (
                      <tr key={id}>
                        <td><strong>{item.customerName}</strong></td>
                        <td>{item.productName || "—"}</td>
                        <td>
                          <Rating value={Number(item.rating) || 0} readOnly size="small" />
                        </td>
                        <td className="admin-dash__review-comment" title={comment}>
                          {truncateComment(comment)}
                        </td>
                        <td>{formatReviewDate(item.dateCreated || item.date)}</td>
                        <td>
                          <span
                            className={`admin-dash__status-badge admin-dash__status-badge--${getReviewStatusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-dash__actions admin-dash__actions--reviews">
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Approve"
                              disabled={item.status === "approved"}
                              onClick={() => updateReviewStatus(id, "approved")}
                            >
                              <FaCheck />
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Reject"
                              disabled={item.status === "rejected"}
                              onClick={() => updateReviewStatus(id, "rejected")}
                            >
                              <FaTimes />
                            </button>
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                              title="Delete"
                              onClick={() => requestDelete(item)}
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
            itemLabel="reviews"
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
        title="Delete review?"
        message={
          deleteTarget
            ? `Are you sure you want to delete the review from "${deleteTarget.label}"? This action cannot be undone.`
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
