import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FaPrint, FaFileDownload } from "react-icons/fa";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import OrderStatusDialog from "./OrderStatusDialog";
import {
  downloadOrderPdf,
  formatCurrency,
  formatOrderDate,
  getOrderDisplayId,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  getTimelineSteps,
  normalizeOrder,
  printOrderInvoice,
} from "./orderUtils";
import { getSampleOrderById, isSampleOrderId } from "./orderListUtils";

function DetailItem({ label, value }) {
  return (
    <div className="admin-dash__detail-item">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="admin-dash__panel admin-dash__order-section">
      <h2 className="admin-dash__panel-title">{title}</h2>
      {children}
    </section>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlertBox } = useOutletContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("placed");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      if (isSampleOrderId(id)) {
        const sample = getSampleOrderById(id);
        if (!cancelled) {
          setOrder(sample ? normalizeOrder(sample) : null);
          setUsingSampleData(Boolean(sample));
          setLoading(false);
        }
        return;
      }

      const res = await fetchDataFromApi(`/api/orders/${id}`);
      if (cancelled) return;

      if (res && (res._id || res.id)) {
        setOrder(normalizeOrder(res));
        setUsingSampleData(false);
      } else {
        setOrder(null);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const timeline = useMemo(() => (order ? getTimelineSteps(order.status) : []), [order]);

  const openStatusDialog = () => {
    setNextStatus(order?.status || "placed");
    setStatusDialogOpen(true);
  };

  const saveStatus = () => {
    if (!order) return;

    if (usingSampleData || isSampleOrderId(id)) {
      const updated = normalizeOrder({
        ...order,
        status: nextStatus,
        statusHistory: [
          ...(order.statusHistory || []),
          { status: nextStatus, date: new Date().toISOString() },
        ],
      });
      setOrder(updated);
      setStatusDialogOpen(false);
      setAlertBox?.({ open: true, error: false, msg: "Order status updated (sample)." });
      return;
    }

    setSavingStatus(true);
    editData(`/api/orders/${id}`, { status: nextStatus })
      .then((res) => {
        setOrder(normalizeOrder(res));
        setStatusDialogOpen(false);
        setAlertBox?.({ open: true, error: false, msg: "Order status updated." });
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update order status." });
      })
      .finally(() => setSavingStatus(false));
  };

  if (loading) {
    return (
      <div className="admin-dash__product-view-loading">
        <p className="admin-dash__subtitle">Loading order details…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <AdminPageHeader
          title="Order not found"
          breadcrumbs={[
            { label: "Orders", to: `${ADMIN_BASE}/orders` },
            { label: "Details" },
          ]}
        />
        <section className="admin-dash__panel admin-dash__product-view-empty">
          <p>We could not find an order with this ID.</p>
          <Link to={`${ADMIN_BASE}/orders`} className="admin-dash__btn">
            Back to order list
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={`Order ${getOrderDisplayId(order)}`}
        subtitle={`Placed on ${formatOrderDate(order.date)}`}
        breadcrumbs={[
          { label: "Orders", to: `${ADMIN_BASE}/orders` },
          { label: "Details" },
        ]}
        action={
          <div className="admin-dash__order-detail-actions">
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={openStatusDialog}>
              Change Status
            </button>
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={() => printOrderInvoice(order)}>
              <FaPrint aria-hidden />
              Print Invoice
            </button>
            <button type="button" className="admin-dash__btn" onClick={() => downloadOrderPdf(order)}>
              <FaFileDownload aria-hidden />
              Download PDF
            </button>
          </div>
        }
      />

      {usingSampleData && (
        <p className="admin-dash__sample-banner">Showing sample order details for preview.</p>
      )}

      <div className="admin-dash__order-detail-grid">
        <DetailSection title="Customer">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Name" value={order.name} />
            <DetailItem label="Phone" value={order.phoneNumber} />
            <DetailItem label="Email" value={order.email} />
            <DetailItem label="Address" value={`${order.address}${order.pincode ? `, ${order.pincode}` : ""}`} />
          </dl>
        </DetailSection>

        <DetailSection title="Status Timeline">
          <ol className="admin-dash__order-timeline">
            {timeline.map((step, index) => (
              <li
                key={step.value}
                className={`admin-dash__order-timeline-step${
                  step.completed ? " admin-dash__order-timeline-step--done" : ""
                }${step.active ? " admin-dash__order-timeline-step--active" : ""}${
                  step.cancelled ? " admin-dash__order-timeline-step--cancelled" : ""
                }`}
              >
                <span className="admin-dash__order-timeline-dot" aria-hidden />
                <div>
                  <strong>{step.label}</strong>
                  {step.active && <span className="admin-dash__order-timeline-current">Current</span>}
                </div>
                {index < timeline.length - 1 && <span className="admin-dash__order-timeline-line" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="admin-dash__order-status-badges">
            <span className={`admin-dash__status-badge admin-dash__status-badge--${getOrderStatusBadgeClass(order.status)}`}>
              Order: {order.status}
            </span>
            <span className={`admin-dash__status-badge admin-dash__status-badge--${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </DetailSection>
      </div>

      <DetailSection title="Items">
        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--orders">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.products || []).map((item, index) => (
                  <tr key={`${item.productTitle}-${index}`}>
                    <td>
                      <div className="admin-dash__order-item-product">
                        {item.image ? (
                          <img src={item.image} alt="" className="admin-dash__table-thumb" />
                        ) : (
                          <div className="admin-dash__product-placeholder admin-dash__table-thumb" />
                        )}
                        <strong>{item.productTitle || "Product"}</strong>
                      </div>
                    </td>
                    <td>{item.variant || "—"}</td>
                    <td>{item.quantity ?? 0}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td><strong>{formatCurrency(item.subTotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DetailSection>

      <div className="admin-dash__order-detail-grid">
        <DetailSection title="Payment">
          <dl className="admin-dash__detail-grid">
            <DetailItem label="Payment method" value={order.paymentMethod} />
            <DetailItem label="Payment ID" value={order.paymentId} />
            <DetailItem
              label="Payment status"
              value={
                <span className={`admin-dash__status-badge admin-dash__status-badge--${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              }
            />
          </dl>
        </DetailSection>

        <DetailSection title="Order Summary">
          <div className="admin-dash__order-summary">
            <div className="admin-dash__order-summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(order.subtotal)}</strong>
            </div>
            <div className="admin-dash__order-summary-row">
              <span>Discount</span>
              <strong>- {formatCurrency(order.discount)}</strong>
            </div>
            <div className="admin-dash__order-summary-row">
              <span>Tax</span>
              <strong>{formatCurrency(order.tax)}</strong>
            </div>
            <div className="admin-dash__order-summary-row">
              <span>Shipping</span>
              <strong>{formatCurrency(order.shipping)}</strong>
            </div>
            <div className="admin-dash__order-summary-row admin-dash__order-summary-row--total">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </div>
        </DetailSection>
      </div>

      <div className="admin-dash__order-detail-footer">
        <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={() => navigate(`${ADMIN_BASE}/orders`)}>
          Back to order list
        </button>
      </div>

      <OrderStatusDialog
        open={statusDialogOpen}
        order={order}
        value={nextStatus}
        onChange={setNextStatus}
        onConfirm={saveStatus}
        onCancel={() => setStatusDialogOpen(false)}
        saving={savingStatus}
      />
    </>
  );
}
