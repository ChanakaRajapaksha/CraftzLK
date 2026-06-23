import CircularProgress from "@mui/material/CircularProgress";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MyContext } from "../../App";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";
import { getCartSubtotal, parsePriceValue, saveLocalCart } from "../../utils/cartHelpers";
import { addLocalOrder } from "../../utils/orderHelpers";
import "./Checkout.css";

const FLAT_SHIPPING_LKR = 450;
const MIN_LOADING_MS = 550;

function formatRsDecimal(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    firstName: "",
    lastName: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    phoneNumber: "",
    email: "",
    shipFirstName: "",
    shipLastName: "",
    shipStreetAddressLine1: "",
    shipStreetAddressLine2: "",
    shipCity: "",
    orderNotes: "",
  });
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPageReady, setIsPageReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const context = useContext(MyContext);
  const history = useNavigate();

  const cartItems = useMemo(
    () => (Array.isArray(context.cartData) ? context.cartData : []),
    [context.cartData]
  );

  const subtotal = useMemo(() => getCartSubtotal(cartItems), [cartItems]);
  const shipping = cartItems.length > 0 ? FLAT_SHIPPING_LKR : 0;
  const orderTotal = subtotal + shipping;

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setEnableFilterTab?.(false);

    let cancelled = false;
    const started = Date.now();

    const finish = () => {
      if (!cancelled) setIsPageReady(true);
    };

    context.getCartData?.();

    const timer = setTimeout(() => {
      const elapsed = Date.now() - started;
      if (elapsed >= MIN_LOADING_MS) {
        finish();
      } else {
        setTimeout(finish, MIN_LOADING_MS - elapsed);
      }
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleShipToDifferentChange = (checked) => {
    setShipToDifferent(checked);
    if (!checked) {
      setFormFields((prev) => ({
        ...prev,
        shipFirstName: "",
        shipLastName: "",
        shipStreetAddressLine1: "",
        shipStreetAddressLine2: "",
        shipCity: "",
      }));
    }
  };

  const submitOrder = (orderId) => {
    const fullName = `${formFields.firstName.trim()} ${formFields.lastName.trim()}`.trim();
    const orderDate = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const orderDetails = {
      orderId,
      firstName: formFields.firstName.trim(),
      name: fullName,
      email: formFields.email,
      paymentMethod,
      subtotal,
      shipping,
      total: orderTotal,
      date: orderDate,
      items: cartItems.map((item) => ({
        id: item._id || item.id || item.productId,
        title: item.productTitle,
        quantity: item.quantity || 1,
        lineTotal:
          item.subTotal ?? parsePriceValue(item.price) * (item.quantity || 1),
      })),
    };

    setOrderPlaced(true);
    addLocalOrder(orderDetails);
    saveLocalCart([]);
    context.setCartData?.([]);

    try {
      sessionStorage.setItem("lastOrder", JSON.stringify(orderDetails));
    } catch {
      /* storage optional */
    }

    setTimeout(() => {
      history("/thank-you", { state: { order: orderDetails } });
    }, 1600);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (context.isLogin !== true) {
      toast.info("Please sign in to place your order.");
      history("/signIn", { state: { from: "/checkout" } });
      return;
    }

    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const orderPrefix = paymentMethod === "cod" ? "COD" : "BANK";
    const userSuffix = user?.userId || "guest";
    const orderId = `${orderPrefix}_${Date.now()}_${userSuffix}`;
    submitOrder(orderId);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container">
          <div className="checkout-page__success" role="status" aria-live="polite">
            <span className="checkout-page__success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5 10 17.5 19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 className="checkout-page__success-title">Order placed successfully!</h2>
            <p className="checkout-page__success-text">
              Taking you to your order confirmation…
            </p>
            <CircularProgress size={28} thickness={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!isPageReady) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container">
          <div className="checkout-page__loading" role="status" aria-live="polite">
            <CircularProgress size={40} thickness={4} />
            <span>Preparing checkout…</span>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container">
          <h1 className="checkout-page__title">Checkout</h1>
          <div className="checkout-page__empty">
            <p>Your cart is empty.</p>
            <p>
              <Link to={COLLECTIONS_ALL_PATH}>Start shopping</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        <h1 className="checkout-page__title">Checkout</h1>

        <form className="checkout-page__layout" onSubmit={handlePlaceOrder} noValidate>
          <section className="checkout-page__billing" aria-labelledby="checkout-billing-heading">
            <h2 id="checkout-billing-heading" className="checkout-page__section-title">
              Billing details
            </h2>

            <div className="checkout-page__row checkout-page__row--half">
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="given-name"
                  value={formFields.firstName}
                  onChange={onChangeInput}
                />
              </div>
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="family-name"
                  value={formFields.lastName}
                  onChange={onChangeInput}
                />
              </div>
            </div>

            <p className="checkout-page__fieldset-label">Street address</p>
            <div className="checkout-page__row">
              <div className="checkout-page__field">
                <input
                  name="streetAddressLine1"
                  type="text"
                  className="checkout-page__input"
                  placeholder="House number and street name"
                  autoComplete="address-line1"
                  value={formFields.streetAddressLine1}
                  onChange={onChangeInput}
                />
              </div>
              <div className="checkout-page__field">
                <input
                  name="streetAddressLine2"
                  type="text"
                  className="checkout-page__input"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  autoComplete="address-line2"
                  value={formFields.streetAddressLine2}
                  onChange={onChangeInput}
                />
              </div>
            </div>

            <div className="checkout-page__row">
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="city">
                  Town / City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="address-level2"
                  value={formFields.city}
                  onChange={onChangeInput}
                />
              </div>
            </div>

            <div className="checkout-page__row checkout-page__row--half">
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="phoneNumber">
                  Phone
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="checkout-page__input"
                  autoComplete="tel"
                  placeholder="0712345678"
                  value={formFields.phoneNumber}
                  onChange={onChangeInput}
                />
              </div>
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="checkout-page__input"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formFields.email}
                  onChange={onChangeInput}
                />
              </div>
            </div>

            <label className="checkout-page__checkbox">
              <input
                type="checkbox"
                checked={shipToDifferent}
                onChange={(e) => handleShipToDifferentChange(e.target.checked)}
                aria-expanded={shipToDifferent}
                aria-controls="checkout-shipping-fields"
              />
              Ship to a different address?
            </label>

            <div
              id="checkout-shipping-fields"
              className={`checkout-page__shipping-panel${
                shipToDifferent ? " checkout-page__shipping-panel--open" : ""
              }`}
              aria-hidden={!shipToDifferent}
            >
              <div className="checkout-page__shipping-panel-inner">
                <div className="checkout-page__row checkout-page__row--half checkout-page__shipping-row">
                  <div className="checkout-page__field">
                    <label className="checkout-page__label" htmlFor="shipFirstName">
                      First name
                    </label>
                    <input
                      id="shipFirstName"
                      name="shipFirstName"
                      type="text"
                      className="checkout-page__input"
                      autoComplete="shipping given-name"
                      value={formFields.shipFirstName}
                      onChange={onChangeInput}
                      tabIndex={shipToDifferent ? 0 : -1}
                    />
                  </div>
                  <div className="checkout-page__field">
                    <label className="checkout-page__label" htmlFor="shipLastName">
                      Last name
                    </label>
                    <input
                      id="shipLastName"
                      name="shipLastName"
                      type="text"
                      className="checkout-page__input"
                      autoComplete="shipping family-name"
                      value={formFields.shipLastName}
                      onChange={onChangeInput}
                      tabIndex={shipToDifferent ? 0 : -1}
                    />
                  </div>
                </div>

                <p className="checkout-page__fieldset-label checkout-page__shipping-row">
                  Street address
                </p>
                <div className="checkout-page__row checkout-page__shipping-row">
                  <div className="checkout-page__field">
                    <input
                      name="shipStreetAddressLine1"
                      type="text"
                      className="checkout-page__input"
                      placeholder="House number and street name"
                      autoComplete="shipping address-line1"
                      value={formFields.shipStreetAddressLine1}
                      onChange={onChangeInput}
                      tabIndex={shipToDifferent ? 0 : -1}
                    />
                  </div>
                  <div className="checkout-page__field">
                    <input
                      name="shipStreetAddressLine2"
                      type="text"
                      className="checkout-page__input"
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      autoComplete="shipping address-line2"
                      value={formFields.shipStreetAddressLine2}
                      onChange={onChangeInput}
                      tabIndex={shipToDifferent ? 0 : -1}
                    />
                  </div>
                </div>

                <div className="checkout-page__row checkout-page__shipping-row">
                  <div className="checkout-page__field">
                    <label className="checkout-page__label" htmlFor="shipCity">
                      Town / City
                    </label>
                    <input
                      id="shipCity"
                      name="shipCity"
                      type="text"
                      className="checkout-page__input"
                      autoComplete="shipping address-level2"
                      value={formFields.shipCity}
                      onChange={onChangeInput}
                      tabIndex={shipToDifferent ? 0 : -1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="checkout-page__field">
              <label className="checkout-page__label" htmlFor="orderNotes">
                Order notes (optional)
              </label>
              <textarea
                id="orderNotes"
                name="orderNotes"
                className="checkout-page__textarea"
                placeholder="Notes about your order, e.g. special notes for delivery."
                value={formFields.orderNotes}
                onChange={onChangeInput}
              />
            </div>
          </section>

          <aside className="checkout-page__order" aria-labelledby="checkout-order-heading">
            <h2 id="checkout-order-heading" className="checkout-page__section-title">
              Your order
            </h2>

            <table className="checkout-page__table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const lineTotal =
                    item.subTotal ??
                    parsePriceValue(item.price) * (item.quantity || 1);
                  const key = item._id || item.id || item.productId;
                  return (
                    <tr key={key}>
                      <td>
                        <span className="checkout-page__product-name">
                          {item.productTitle} × {item.quantity || 1}
                        </span>
                      </td>
                      <td>{formatRsDecimal(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="checkout-page__totals">
                <tr>
                  <td>Subtotal</td>
                  <td>{formatRsDecimal(subtotal)}</td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td>Flat rate: {formatRsDecimal(shipping)}</td>
                </tr>
                <tr className="checkout-page__total-row">
                  <td>Total</td>
                  <td>{formatRsDecimal(orderTotal)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="checkout-page__payments">
              <label className="checkout-page__payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="checkout-page__payment-label">Cash on delivery</span>
                {paymentMethod === "cod" && (
                  <p className="checkout-page__payment-hint">Pay with cash upon delivery.</p>
                )}
              </label>

              <div className="checkout-page__payment-item">
                <label className="checkout-page__payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                  />
                  <span className="checkout-page__payment-label">Direct bank transfer</span>
                </label>
                <div
                  className={`checkout-page__payment-detail${
                    paymentMethod === "bank_transfer"
                      ? " checkout-page__payment-detail--open"
                      : ""
                  }`}
                  aria-hidden={paymentMethod !== "bank_transfer"}
                >
                  <div className="checkout-page__payment-detail-inner">
                    <div className="checkout-page__payment-detail-box">
                      <p>
                        Make your payment directly into our bank account (via online or bank
                        deposit). Please use your Order ID as the payment reference and send your
                        slip to our WhatsApp number{" "}
                        <a href="https://wa.me/94715264449" target="_blank" rel="noreferrer">
                          0715264449
                        </a>
                        . Your order will not be shipped until the funds have cleared in our
                        account.
                      </p>
                      <p className="checkout-page__payment-detail-si">
                        ඔබගේ order එක සඳහා ගෙවිය යුතු මුළු මුදල Online Transfer එකකින් හෝ Bank
                        Deposit එකකින් තැන්පත් කර, එයට අදාළ Payment Slip එක ඔබගේ order අංකයත්
                        සමග අපට WhatsApp කරන්න:{" "}
                        <a href="https://wa.me/94715264449" target="_blank" rel="noreferrer">
                          0715264449
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="checkout-page__privacy">
              Your personal data will be used to process your order, support your experience
              throughout this website, and for other purposes described in our{" "}
              <a href="/privacy" onClick={(e) => e.preventDefault()}>
                privacy policy
              </a>
              .
            </p>

            <button
              type="submit"
              className="checkout-page__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing…" : "Place order"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
