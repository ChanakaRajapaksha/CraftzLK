import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";
import { parsePriceValue } from "../../utils/cartHelpers";
import {
  fetchUserOrders,
  getOrderBadgeClass,
  getOrderItemCount,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getTimelineDoneCount,
} from "../../utils/orderHelpers";
import "./Orders.css";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  bank_transfer: "Direct Bank Transfer",
};

const TIMELINE_STEPS = ["Order confirmed", "Handcrafting", "Shipped", "Delivered"];

function formatRs(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getItemPreview(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) return "No items listed";
  const first = items[0].title;
  const extra = items.length - 1;
  return extra > 0 ? `${first} and ${extra} more item${extra > 1 ? "s" : ""}` : first;
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="my-orders__detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setEnableFilterTab?.(false);

    fetchUserOrders()
      .then((stored) => {
        setOrders(stored);
        if (stored.length > 0) {
          setExpandedId(stored[0].orderId);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce(
      (sum, order) => sum + parsePriceValue(order.total),
      0
    );
    const totalItems = orders.reduce(
      (sum, order) => sum + getOrderItemCount(order),
      0
    );
    return { totalSpent, totalItems };
  }, [orders]);

  const toggleExpanded = (orderId) => {
    setExpandedId((current) => (current === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="my-orders">
        <div className="my-orders__container">
          <p className="my-orders__subtitle">Loading your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders__container">
        <div className="my-orders__header">
          <p className="my-orders__eyebrow">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <rect
                x="9"
                y="3"
                width="6"
                height="4"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Order history
          </p>
          <h1 className="my-orders__title">My orders</h1>
          <p className="my-orders__subtitle">
            Track your handcrafted pieces from confirmation to delivery.
          </p>
        </div>

        {orders.length > 0 && (
          <div className="my-orders__stats">
            <div className="my-orders__stat">
              <span className="my-orders__stat-value my-orders__stat-value--accent">
                {orders.length}
              </span>
              <span className="my-orders__stat-label">
                {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            <div className="my-orders__stat">
              <span className="my-orders__stat-value">{stats.totalItems}</span>
              <span className="my-orders__stat-label">Items crafted</span>
            </div>
            <div className="my-orders__stat">
              <span className="my-orders__stat-value">{formatRs(stats.totalSpent)}</span>
              <span className="my-orders__stat-label">Total spent</span>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="my-orders__empty">
            <span className="my-orders__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="my-orders__empty-title">No orders yet</h2>
            <p className="my-orders__empty-text">
              When you place an order, it will appear here so you can follow every step of
              the crafting journey.
            </p>
            <Link to={COLLECTIONS_ALL_PATH} className="my-orders__btn">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="my-orders__list">
            {orders.map((order, index) => {
              const isExpanded = expandedId === order.orderId;
              const items = Array.isArray(order.items) ? order.items : [];
              const itemCount = getOrderItemCount(order);
              const statusLabel = getOrderStatusLabel(order.status);
              const badgeClass = getOrderBadgeClass(order.status);
              const timelineDone = getTimelineDoneCount(order.status);

              return (
                <article
                  key={order.orderId}
                  className={`my-orders__card${isExpanded ? " my-orders__card--expanded" : ""}`}
                  style={{ "--card-index": index }}
                >
                  <button
                    type="button"
                    className="my-orders__card-head"
                    onClick={() => toggleExpanded(order.orderId)}
                    aria-expanded={isExpanded}
                  >
                    <div className="my-orders__card-main">
                      <div className="my-orders__card-top">
                        <span className="my-orders__order-id">{order.orderId}</span>
                        <span className={`my-orders__badge my-orders__badge--${badgeClass}`}>
                          <span className="my-orders__badge-dot" aria-hidden="true" />
                          {statusLabel}
                        </span>
                      </div>
                      <p className="my-orders__card-date">{order.date}</p>
                      <p className="my-orders__card-preview">
                        {itemCount} item{itemCount !== 1 ? "s" : ""} · {getItemPreview(order)}
                      </p>
                    </div>
                    <div className="my-orders__card-right">
                      <span className="my-orders__card-total">{formatRs(order.total)}</span>
                      <span className="my-orders__card-chevron" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="m6 9 6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>

                  <div className="my-orders__card-body">
                    <div className="my-orders__card-body-inner">
                      <div className="my-orders__card-details">
                        <section className="my-orders__section my-orders__section--timeline">
                          <h3 className="my-orders__section-title">Order progress</h3>
                          <ol className="my-orders__timeline" aria-label="Order progress">
                            {TIMELINE_STEPS.map((label, stepIndex) => {
                              const isDone = stepIndex < timelineDone;
                              return (
                                <li
                                  key={label}
                                  className={`my-orders__timeline-step${
                                    isDone ? " my-orders__timeline-step--done" : ""
                                  }`}
                                >
                                  <span className="my-orders__timeline-dot">
                                    {isDone && (
                                      <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                        <path
                                          d="M2.5 6 5 8.5 9.5 3.5"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="my-orders__timeline-label">{label}</span>
                                </li>
                              );
                            })}
                          </ol>
                        </section>

                        <div className="my-orders__details-grid">
                          <section className="my-orders__section my-orders__section--items">
                            <h3 className="my-orders__section-title">
                              Items in this order
                              <span className="my-orders__section-count">{itemCount}</span>
                            </h3>
                            <ul className="my-orders__items">
                              {items.map((item, itemIndex) => (
                                <li key={item.id || itemIndex} className="my-orders__item">
                                  <span className="my-orders__item-name">
                                    {item.title}
                                    {item.variant ? ` (${item.variant})` : ""}
                                    <span className="my-orders__item-qty"> × {item.quantity}</span>
                                  </span>
                                  <span className="my-orders__item-price">
                                    {formatRs(item.lineTotal)}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            <div className="my-orders__totals">
                              <div className="my-orders__totals-row">
                                <span>Subtotal</span>
                                <span>{formatRs(order.subtotal)}</span>
                              </div>
                              <div className="my-orders__totals-row">
                                <span>Shipping</span>
                                <span>{formatRs(order.shipping)}</span>
                              </div>
                              <div className="my-orders__totals-row my-orders__totals-row--total">
                                <span>Total</span>
                                <span>{formatRs(order.total)}</span>
                              </div>
                            </div>
                          </section>

                          <aside className="my-orders__aside">
                            <section className="my-orders__section">
                              <h3 className="my-orders__section-title">Customer</h3>
                              <dl className="my-orders__detail-list">
                                <DetailRow label="Name" value={order.name} />
                                <DetailRow label="Phone" value={order.phoneNumber} />
                                <DetailRow label="Email" value={order.email} />
                              </dl>
                            </section>

                            <section className="my-orders__section">
                              <h3 className="my-orders__section-title">Payment</h3>
                              <dl className="my-orders__detail-list">
                                <DetailRow
                                  label="Method"
                                  value={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
                                />
                                <DetailRow
                                  label="Status"
                                  value={getPaymentStatusLabel(order.paymentStatus)}
                                />
                              </dl>
                            </section>

                            {(order.address || order.shippingAddress) && (
                              <section className="my-orders__section">
                                <h3 className="my-orders__section-title">Delivery</h3>
                                <dl className="my-orders__detail-list">
                                  <DetailRow label="Billing" value={order.address} />
                                  <DetailRow label="Shipping" value={order.shippingAddress} />
                                </dl>
                              </section>
                            )}

                            {order.orderNotes && (
                              <section className="my-orders__section">
                                <h3 className="my-orders__section-title">Order notes</h3>
                                <p className="my-orders__notes">{order.orderNotes}</p>
                              </section>
                            )}
                          </aside>
                        </div>

                        {order.paymentMethod === "bank_transfer" && (
                          <div className="my-orders__bank-note">
                            Please transfer {formatRs(order.total)} and send your payment slip
                            with order <strong>{order.orderId}</strong> to{" "}
                            <a href="https://wa.me/94715264449" target="_blank" rel="noreferrer">
                              0715264449
                            </a>
                            . Your order ships once the funds have cleared.
                          </div>
                        )}

                        {order.paymentMethod === "cod" && (
                          <div className="my-orders__bank-note">
                            Payment status: Pending — pay with cash when your order is delivered.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {orders.length > 0 && (
          <footer className="my-orders__footer">
            <Link to={COLLECTIONS_ALL_PATH} className="my-orders__footer-link">
              Continue shopping
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Orders;
