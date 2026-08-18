import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useModalBodyLock } from "../../../hooks/useModalFormLifecycle";
import {
  formatQuestionDate,
  getQuestionStatusBadgeClass,
  getQuestionStatusLabel,
} from "./questionUtils";

function DetailItem({ label, value, children }) {
  return (
    <div className="admin-dash__detail-item">
      <dt>{label}</dt>
      <dd>{children ?? value ?? "—"}</dd>
    </div>
  );
}

export default function QuestionDetailsModal({
  open,
  question,
  onClose,
  onSaveAnswer,
  onApproveAnswer,
  saving = false,
  approving = false,
}) {
  useModalBodyLock(open, onClose);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    if (!open || !question) {
      setAnswerText("");
      return;
    }
    setAnswerText(question.answer || "");
  }, [open, question]);

  if (!open || !question) return null;

  const isAnswered = question.status === "answered";
  const canApprove = answerText.trim().length > 0 && !isAnswered;

  const handleSave = () => {
    if (!answerText.trim() || saving || approving) return;
    onSaveAnswer?.(question, answerText.trim());
  };

  const handleApprove = () => {
    if (!canApprove || saving || approving) return;
    onApproveAnswer?.(question, answerText.trim());
  };

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
        aria-labelledby="question-details-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Review Management</p>
            <h2 id="question-details-modal-title" className="admin-dash__settings-modal-title">
              Question details
            </h2>
            <p className="admin-dash__settings-modal-sub">
              Customer question for {question.productName || "this product"}.
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close question details"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          <section className="admin-dash__panel admin-dash__review-details-panel">
            <dl className="admin-dash__detail-grid">
              <DetailItem label="Customer" value={question.customerName} />
              <DetailItem label="Email" value={question.email} />
              <DetailItem label="Product" value={question.productName} />
              <DetailItem label="Product ID" value={question.productId} />
              <DetailItem label="Status">
                <span
                  className={`admin-dash__status-badge admin-dash__status-badge--${getQuestionStatusBadgeClass(question.status)}`}
                >
                  {getQuestionStatusLabel(question.status)}
                </span>
              </DetailItem>
              <DetailItem
                label="Submitted"
                value={formatQuestionDate(question.dateCreated)}
              />
              {isAnswered && (
                <DetailItem
                  label="Answered"
                  value={formatQuestionDate(question.answerDate)}
                />
              )}
            </dl>

            <div className="admin-dash__review-details-comment">
              <h3 className="admin-dash__review-details-comment-label">Question</h3>
              <p className="admin-dash__product-view-description">
                {question.question || "—"}
              </p>
            </div>

            <div className="admin-dash__review-details-comment">
              <label
                htmlFor="question-answer-input"
                className="admin-dash__review-details-comment-label"
              >
                Answer
              </label>
              <textarea
                id="question-answer-input"
                className="admin-dash__textarea"
                rows={5}
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Write a reply from CraftzLK…"
                disabled={saving || approving}
              />
              {isAnswered && question.answerAuthor && (
                <p className="admin-dash__settings-modal-sub" style={{ marginTop: "0.75rem" }}>
                  Reply author: {question.answerAuthor}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="admin-dash__settings-modal-foot">
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="admin-dash__btn admin-dash__btn--ghost"
            onClick={handleSave}
            disabled={!answerText.trim() || saving || approving}
          >
            {saving ? "Saving…" : "Save answer"}
          </button>
          <button
            type="button"
            className="admin-dash__btn admin-dash__btn--primary"
            onClick={handleApprove}
            disabled={!canApprove || saving || approving}
          >
            {approving ? "Approving…" : "Approve answer"}
          </button>
        </div>
      </div>
    </div>
  );
}
