import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import UserAvatarImgComponent from "../../Components/userAvatarImg";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";
import { getCartItemCount, parsePriceValue } from "../../utils/cartHelpers";
import {
  fetchUserOrders,
  getOrderItemCount,
} from "../../utils/orderHelpers";
import { fetchDataFromApi } from "../../utils/api";
import "./MyAccount.css";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

function formatRs(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getItemPreview(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) return "No items listed";
  const first = items[0].title;
  const extra = items.length - 1;
  return extra > 0 ? `${first} + ${extra} more` : first;
}

const MyAccount = () => {
  const context = useContext(MyContext);
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);

  const storedUser = useMemo(() => getStoredUser(), []);
  const user = context?.user?.userId ? context.user : storedUser;

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setEnableFilterTab?.(false);
    context?.setisHeaderFooterShow?.(true);

    const localUser = getStoredUser();
    if (localUser?.userId) {
      fetchUserOrders()
        .then(setOrders)
        .catch(() => setOrders([]));

      fetchDataFromApi(`/api/user/${localUser.userId}`)
        .then((res) => {
          if (res?.phone) setPhone(res.phone);
        })
        .catch(() => {
          /* demo UI — local data only */
        });
    }
  }, [context]);

  const cartItems = Array.isArray(context?.cartData) ? context.cartData : [];
  const cartCount = getCartItemCount(cartItems);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + parsePriceValue(item.price) * (item.quantity || 1),
    0
  );

  const orderStats = useMemo(() => {
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

  const recentOrders = orders.slice(0, 3);
  const cartPreview = cartItems.slice(0, 4);
  const displayName = user?.name || "Guest";
  const isAdmin = user?.role === "admin";
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const profileFirstName = nameParts[0] || "";
  const profileLastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  return (
    <div className="my-account">
      <div className="my-account__container">
        <div className="my-account__header">
          <p className="my-account__eyebrow">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            Account overview
          </p>
          <h1 className="my-account__title">My account</h1>
          <p className="my-account__subtitle">
            Welcome back, {displayName.split(" ")[0] || "friend"}. Here is a snapshot of
            your profile, orders, and activity.
          </p>
        </div>

        <div className="my-account__layout">
          <aside className="my-account__sidebar">
            <div className="my-account__profile-card">
              <div className="my-account__avatar-wrap">
                <UserAvatarImgComponent
                  lg
                  img={user?.image}
                  userName={displayName}
                  firstName={profileFirstName}
                  lastName={profileLastName}
                />
              </div>
              <h2 className="my-account__profile-name">{displayName}</h2>
              <p className="my-account__profile-email">{user?.email || "—"}</p>
              <span
                className={`my-account__badge${isAdmin ? " my-account__badge--admin" : ""}`}
              >
                {isAdmin ? "Admin account" : "CraftzLK member"}
              </span>
            </div>

            <ul className="my-account__quick-links">
              <li>
                <Link to="/orders" className="my-account__quick-link">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                  View all orders
                </Link>
              </li>
              <li>
                <Link to={COLLECTIONS_ALL_PATH} className="my-account__quick-link">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                  Continue shopping
                </Link>
              </li>
              <li>
                <Link to="/cart" className="my-account__quick-link">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 6h15l-1.5 9h-12L6 6Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                  </svg>
                  View cart
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/dashboard" className="my-account__quick-link">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
                    </svg>
                    Admin dashboard
                  </Link>
                </li>
              )}
            </ul>
          </aside>

          <div className="my-account__main">
            <div className="my-account__stats">
              <div className="my-account__stat">
                <span className="my-account__stat-value my-account__stat-value--accent">
                  {orders.length}
                </span>
                <span className="my-account__stat-label">Orders</span>
              </div>
              <div className="my-account__stat">
                <span className="my-account__stat-value">
                  {formatRs(orderStats.totalSpent)}
                </span>
                <span className="my-account__stat-label">Total spent</span>
              </div>
              <div className="my-account__stat">
                <span className="my-account__stat-value">{cartCount}</span>
                <span className="my-account__stat-label">Items in cart</span>
              </div>
              <div className="my-account__stat">
                <span className="my-account__stat-value">{orderStats.totalItems}</span>
                <span className="my-account__stat-label">Items purchased</span>
              </div>
            </div>

            <section className="my-account__panel" aria-labelledby="account-details-heading">
              <div className="my-account__panel-head">
                <h2 id="account-details-heading" className="my-account__panel-title">
                  Account details
                </h2>
              </div>
              <dl className="my-account__details">
                <div className="my-account__detail">
                  <dt className="my-account__detail-label">Full name</dt>
                  <dd className="my-account__detail-value">{displayName}</dd>
                </div>
                <div className="my-account__detail">
                  <dt className="my-account__detail-label">Email address</dt>
                  <dd className="my-account__detail-value">{user?.email || "—"}</dd>
                </div>
                <div className="my-account__detail">
                  <dt className="my-account__detail-label">Phone number</dt>
                  <dd className="my-account__detail-value">{phone || "Not provided"}</dd>
                </div>
                <div className="my-account__detail">
                  <dt className="my-account__detail-label">Account ID</dt>
                  <dd className="my-account__detail-value">{user?.userId || "—"}</dd>
                </div>
              </dl>
            </section>

            <section className="my-account__panel" aria-labelledby="recent-orders-heading">
              <div className="my-account__panel-head">
                <h2 id="recent-orders-heading" className="my-account__panel-title">
                  Recent orders
                </h2>
                {orders.length > 0 && (
                  <Link to="/orders" className="my-account__panel-link">
                    View all →
                  </Link>
                )}
              </div>

              {recentOrders.length > 0 ? (
                <ul className="my-account__orders">
                  {recentOrders.map((order) => (
                    <li key={order.orderId} className="my-account__order">
                      <div>
                        <span className="my-account__order-id">{order.orderId}</span>
                        <p className="my-account__order-meta">
                          {order.date} · {getItemPreview(order)} ·{" "}
                          {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                        </p>
                      </div>
                      <div className="my-account__order-right">
                        <span className="my-account__order-total">
                          {formatRs(order.total)}
                        </span>
                        <span className="my-account__order-status">
                          {order.status || "Confirmed"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="my-account__empty">
                  <h3 className="my-account__empty-title">No orders yet</h3>
                  <p className="my-account__empty-text">
                    When you place an order, it will appear here for quick reference.
                  </p>
                  <Link to={COLLECTIONS_ALL_PATH} className="my-account__btn">
                    Start shopping
                  </Link>
                </div>
              )}
            </section>

            <section className="my-account__panel" aria-labelledby="cart-preview-heading">
              <div className="my-account__panel-head">
                <h2 id="cart-preview-heading" className="my-account__panel-title">
                  Cart preview
                </h2>
                {cartCount > 0 && (
                  <Link to="/cart" className="my-account__panel-link">
                    Go to cart →
                  </Link>
                )}
              </div>

              {cartPreview.length > 0 ? (
                <div className="my-account__cart-preview">
                  {cartPreview.map((item) => {
                    const key = item._id || item.id || item.productId;
                    const lineTotal =
                      item.subTotal ??
                      parsePriceValue(item.price) * (item.quantity || 1);
                    return (
                      <div key={key} className="my-account__cart-item">
                        <span>
                          {item.productTitle}
                          <span className="my-account__cart-qty">
                            {" "}
                            × {item.quantity || 1}
                          </span>
                        </span>
                        <span>{formatRs(lineTotal)}</span>
                      </div>
                    );
                  })}
                  <div className="my-account__cart-item">
                    <strong>Cart subtotal</strong>
                    <strong>{formatRs(cartSubtotal)}</strong>
                  </div>
                </div>
              ) : (
                <div className="my-account__empty">
                  <h3 className="my-account__empty-title">Your cart is empty</h3>
                  <p className="my-account__empty-text">
                    Browse our handcrafted collections and add something you love.
                  </p>
                  <Link to={COLLECTIONS_ALL_PATH} className="my-account__btn">
                    Browse collections
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
