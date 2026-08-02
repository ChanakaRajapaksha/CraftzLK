import { IoClose } from "react-icons/io5";
import Rating from "@mui/material/Rating";
import { useModalBodyLock } from "../../../hooks/useModalFormLifecycle";
import {
  formatReviewDate,
  getReviewStatusBadgeClass,
  getReviewStatusLabel,
} from "./reviewUtils";

function DetailItem({ label, value, children }) {
  return (
    <div className="admin-dash__detail-item">
      <dt>{label}</dt>
      <dd>{children ?? value ?? "—"}</dd>
    </div>
  );
}

export default function ReviewDetailsModal({ open, review, onClose }) {
  useModalBodyLock(open, onClose);

  if (!open || !review) return null;

  const comment = review.comment || review.review || "";

  return (
    <div
      className="admin-dash__settings-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dash__settings-modal admin-dash__settings-modal--reviews"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-details-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Review Management</p>
            <h2 id="review-details-modal-title" className="admin-dash__settings-modal-title">
              Review details
            </h2>
            <p className="admin-dash__settings-modal-sub">
              Full customer review submission for {review.productName || "this product"}.
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close review details"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          <section className="admin-dash__panel admin-dash__review-details-panel">
            <dl className="admin-dash__detail-grid">
              <DetailItem label="Customer" value={review.customerName} />
              <DetailItem label="Email" value={review.email} />
              <DetailItem label="Product" value={review.productName} />
              <DetailItem label="Product ID" value={review.productId} />
              <DetailItem label="Rating">
                <Rating value={Number(review.rating) || 0} readOnly size="small" />
              </DetailItem>
              <DetailItem label="Status">
                <span
                  className={`admin-dash__status-badge admin-dash__status-badge--${getReviewStatusBadgeClass(review.status)}`}
                >
                  {getReviewStatusLabel(review.status)}
                </span>
              </DetailItem>
              <DetailItem
                label="Submitted"
                value={formatReviewDate(review.dateCreated || review.date)}
              />
              <DetailItem label="Review title" value={review.title} />
            </dl>

            <div className="admin-dash__review-details-comment">
              <h3 className="admin-dash__review-details-comment-label">Review content</h3>
              <p className="admin-dash__product-view-description">
                {comment || "—"}
              </p>
            </div>

            {Array.isArray(review.images) && review.images.length > 0 && (
              <div className="admin-dash__review-details-images">
                <h3 className="admin-dash__review-details-comment-label">Review images</h3>
                <div className="admin-dash__review-details-image-grid">
                  {review.images.map((imageUrl) => (
                    <a
                      key={imageUrl}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-dash__review-details-image-link"
                    >
                      <img
                        src={imageUrl}
                        alt="Customer review upload"
                        className="admin-dash__review-details-image"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="admin-dash__settings-modal-foot">
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
