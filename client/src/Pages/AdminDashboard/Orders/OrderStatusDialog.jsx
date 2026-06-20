import { ORDER_STATUSES, getOrderDisplayId } from "./orderUtils";

export default function OrderStatusDialog({
  open,
  order,
  value,
  onChange,
  onConfirm,
  onCancel,
  saving = false,
}) {
  if (!open || !order) return null;

  return (
    <div className="admin-dash__confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="admin-dash__confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="order-status-title" className="admin-dash__confirm-title">
          Change order status
        </h2>
        <p className="admin-dash__confirm-message">
          Update the fulfillment status for {getOrderDisplayId(order)}.
        </p>
        <label className="admin-dash__field" htmlFor="order-next-status">
          <span className="admin-dash__label">Order status</span>
          <select
            id="order-next-status"
            className="admin-dash__select"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {ORDER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-dash__confirm-actions">
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-dash__btn" onClick={onConfirm} disabled={saving}>
            {saving ? "Saving…" : "Update status"}
          </button>
        </div>
      </div>
    </div>
  );
}
