export default function AdminConfirmDialog({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;

  return (
    <div className="admin-dash__confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="admin-dash__confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="admin-dash__confirm-title">{title}</h2>
        {message && <p id="admin-confirm-message" className="admin-dash__confirm-message">{message}</p>}
        <div className="admin-dash__confirm-actions">
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-dash__btn${danger ? " admin-dash__btn--danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
