import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";
import { parsePriceValue } from "../../utils/cartHelpers";
import { getPaymentStatusLabel } from "../../utils/orderHelpers";
import "./ThankYou.css";

const CONFETTI_COLORS = ["#c9a961", "#b8860b", "#e8d5a3", "#8c6a2f", "#f0e6cf"];

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 53) % 100}%`,
  delay: `${(i % 9) * 0.35}s`,
  duration: `${3.2 + (i % 5) * 0.55}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  shape: i % 3,
  drift: i % 2 === 0 ? 1 : -1,
}));

function formatRs(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  bank_transfer: "Direct Bank Transfer",
};

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = useMemo(() => {
    if (location.state?.order) return location.state.order;
    try {
      return JSON.parse(sessionStorage.getItem("lastOrder") || "null");
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!order) {
      navigate("/", { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="thank-you">
      <div className="thank-you__confetti" aria-hidden="true">
        {CONFETTI_PIECES.map((piece) => (
          <span
            key={piece.id}
            className={`thank-you__confetti-piece thank-you__confetti-piece--shape${piece.shape}`}
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              "--confetti-color": piece.color,
              "--confetti-drift": piece.drift,
            }}
          />
        ))}
      </div>

      <div className="thank-you__container">
        <div className="thank-you__badge">
          <span className="thank-you__badge-ring" aria-hidden="true" />
          <span className="thank-you__badge-ring thank-you__badge-ring--delay" aria-hidden="true" />
          <svg
            className="thank-you__check"
            viewBox="0 0 64 64"
            role="img"
            aria-label="Order confirmed"
          >
            <circle className="thank-you__check-circle" cx="32" cy="32" r="29" />
            <path className="thank-you__check-mark" d="M19 33.5 28 42.5 45 24" />
          </svg>
        </div>

        <h1 className="thank-you__title">Thank you, {order.firstName || "friend"}!</h1>
        <p className="thank-you__subtitle">
          Your order has been received and is being handcrafted with care.
        </p>

        <div className="thank-you__meta">
          <div className="thank-you__meta-item">
            <span className="thank-you__meta-label">Order number</span>
            <span className="thank-you__meta-value thank-you__meta-value--accent">
              {order.orderId}
            </span>
          </div>
          <div className="thank-you__meta-item">
            <span className="thank-you__meta-label">Date</span>
            <span className="thank-you__meta-value">{order.date}</span>
          </div>
          <div className="thank-you__meta-item">
            <span className="thank-you__meta-label">Total</span>
            <span className="thank-you__meta-value">{formatRs(order.total)}</span>
          </div>
          <div className="thank-you__meta-item">
            <span className="thank-you__meta-label">Payment method</span>
            <span className="thank-you__meta-value">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>
          <div className="thank-you__meta-item">
            <span className="thank-you__meta-label">Payment status</span>
            <span className="thank-you__meta-value">
              {getPaymentStatusLabel(order.paymentStatus)}
            </span>
          </div>
        </div>

        {order.paymentMethod === "bank_transfer" && (
          <div className="thank-you__bank-note">
            <p>
              Please transfer <strong>{formatRs(order.total)}</strong> to our bank account and
              send the payment slip with your order number{" "}
              <strong>{order.orderId}</strong> to our WhatsApp{" "}
              <a href="https://wa.me/94715264449" target="_blank" rel="noreferrer">
                0715264449
              </a>
              . Your order ships once the funds have cleared.
            </p>
          </div>
        )}

        <div className="thank-you__card">
          <h2 className="thank-you__card-title">Order summary</h2>
          <ul className="thank-you__items">
            {items.map((item, index) => (
              <li
                key={item.id || index}
                className="thank-you__item"
                style={{ "--item-index": index }}
              >
                <span className="thank-you__item-name">
                  {item.title}
                  {item.variant ? ` (${item.variant})` : ""}
                  <span className="thank-you__item-qty"> × {item.quantity}</span>
                </span>
                <span className="thank-you__item-price">{formatRs(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="thank-you__totals">
            <div className="thank-you__totals-row">
              <span>Subtotal</span>
              <span>{formatRs(order.subtotal)}</span>
            </div>
            {parsePriceValue(order.discount) > 0 && (
              <div className="thank-you__totals-row thank-you__totals-row--discount">
                <span>
                  Discount
                  {order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span>-{formatRs(order.discount)}</span>
              </div>
            )}
            <div className="thank-you__totals-row">
              <span>Shipping</span>
              <span>{formatRs(order.shipping)}</span>
            </div>
            <div className="thank-you__totals-row thank-you__totals-row--total">
              <span>Total</span>
              <span>{formatRs(order.total)}</span>
            </div>
          </div>
        </div>

        {order.email && (
          <p className="thank-you__email-note">
            A confirmation will be sent to <strong>{order.email}</strong>.
          </p>
        )}

        <div className="thank-you__actions">
          <Link to="/orders" className="thank-you__btn thank-you__btn--primary">
            View my orders
          </Link>
          <Link to={COLLECTIONS_ALL_PATH} className="thank-you__btn thank-you__btn--ghost">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
