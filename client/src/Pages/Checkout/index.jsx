import CircularProgress from "@mui/material/CircularProgress";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";
import { getCartSubtotal, parsePriceValue } from "../../utils/cartHelpers";
import "./Checkout.css";

const FLAT_SHIPPING_LKR = 450;
const MIN_LOADING_MS = 550;

function formatRsDecimal(amount) {
  const n = parsePriceValue(amount);
  return `Rs ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PayhereScript = ({ onPaymentSuccess }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => {
      if (!window.payhere) return;
      window.payhere.onCompleted = function onCompleted(orderId) {
        onPaymentSuccess(orderId);
      };
      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
      };
      window.payhere.onError = function onError(error) {
        console.log("Error:", error);
      };
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [onPaymentSuccess]);
  return null;
};

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    firstName: "",
    lastName: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    phoneNumber: "",
    email: "",
    orderNotes: "",
  });
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPageReady, setIsPageReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (window.payhere) {
      window.payhere.onCompleted = function onCompleted(orderId) {
        processSuccessfulPayment(orderId);
      };
      window.payhere.onDismissed = function onDismissed() {
        context.setAlertBox?.({
          open: true,
          error: true,
          msg: "Payment was cancelled",
        });
      };
      window.payhere.onError = function onError() {
        context.setAlertBox?.({
          open: true,
          error: true,
          msg: "Payment error occurred",
        });
      };
    }

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

  const validateForm = () => {
    const required = [
      ["firstName", "first name"],
      ["lastName", "last name"],
      ["streetAddressLine1", "street address"],
      ["city", "town / city"],
      ["phoneNumber", "phone"],
      ["email", "email address"],
    ];

    for (const [field, label] of required) {
      if (!String(formFields[field] ?? "").trim()) {
        context.setAlertBox?.({
          open: true,
          error: true,
          msg: `Please enter your ${label}.`,
        });
        return false;
      }
    }

    if (cartItems.length === 0) {
      context.setAlertBox?.({
        open: true,
        error: true,
        msg: "Your cart is empty.",
      });
      return false;
    }

    return true;
  };

  const processSuccessfulPayment = async (orderId) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const fullName = `${formFields.firstName.trim()} ${formFields.lastName.trim()}`.trim();
    const address = [formFields.streetAddressLine1, formFields.streetAddressLine2]
      .filter(Boolean)
      .join(", ");

    const payLoad = {
      name: fullName,
      phoneNumber: formFields.phoneNumber,
      address,
      pincode: "N/A",
      amount: Math.round(orderTotal),
      paymentId: orderId,
      email: formFields.email || user?.email,
      userid: user?.userId,
      products: cartItems,
      paymentMethod,
      orderNotes: formFields.orderNotes,
      shipToDifferent,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    try {
      await postData(`/api/orders/create`, payLoad);

      if (user?.userId) {
        try {
          const res = await fetchDataFromApi(`/api/cart?userId=${user.userId}`);
          if (res?.length) {
            for (const item of res) {
              await deleteData(`/api/cart/${item?.id}`);
            }
          }
        } catch {
          /* cart clear optional */
        }
      }

      context.getCartData?.();
      setTimeout(() => context.getCartData?.(), 800);
      history("/orders");
    } catch (error) {
      console.error("Error processing order:", error);
      context.setAlertBox?.({
        open: true,
        error: true,
        msg: "Error processing order",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateBankPayment = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const orderId = `ORDER_${Date.now()}_${user?.userId ?? "guest"}`;
    const fullName = `${formFields.firstName.trim()} ${formFields.lastName.trim()}`.trim();

    const hashResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/payment/get-hash`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
          orderId,
          amount: orderTotal,
          currency: "LKR",
        }),
      }
    );

    const { hash } = await hashResponse.json();

    const payment = {
      sandbox: true,
      merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
      return_url: undefined,
      cancel_url: undefined,
      notify_url: `${import.meta.env.VITE_API_URL}/api/payment/notify`,
      order_id: orderId,
      items: cartItems.map((item) => item.productTitle).join(", "),
      amount: orderTotal.toFixed(2),
      currency: "LKR",
      hash,
      first_name: formFields.firstName,
      last_name: formFields.lastName,
      email: formFields.email,
      phone: formFields.phoneNumber,
      address: formFields.streetAddressLine1,
      city: formFields.city,
      country: "Sri Lanka",
      delivery_address: addressLine(),
      delivery_city: formFields.city,
      delivery_country: "Sri Lanka",
      custom_1: user?.userId,
    };

    window.payhere.startPayment(payment);

    function addressLine() {
      return [formFields.streetAddressLine1, formFields.streetAddressLine2]
        .filter(Boolean)
        .join(", ");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user?.userId) {
      context.setAlertBox?.({
        open: true,
        error: true,
        msg: "Please sign in to place your order.",
      });
      history("/signIn");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        const orderId = `COD_${Date.now()}_${user.userId}`;
        await processSuccessfulPayment(orderId);
        return;
      }

      if (!window.payhere) {
        context.setAlertBox?.({
          open: true,
          error: true,
          msg: "Payment system is loading. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      await initiateBankPayment();
    } catch (error) {
      console.error("Error placing order:", error);
      context.setAlertBox?.({
        open: true,
        error: true,
        msg: "Error placing order",
      });
      setIsSubmitting(false);
    }
  };

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
      <PayhereScript onPaymentSuccess={processSuccessfulPayment} />
      <div className="checkout-page__container">
        <h1 className="checkout-page__title">Checkout</h1>

        <form className="checkout-page__layout" onSubmit={handlePlaceOrder}>
          <section className="checkout-page__billing" aria-labelledby="checkout-billing-heading">
            <h2 id="checkout-billing-heading" className="checkout-page__section-title">
              Billing details
            </h2>

            <div className="checkout-page__row checkout-page__row--half">
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="firstName">
                  First name <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="given-name"
                  value={formFields.firstName}
                  onChange={onChangeInput}
                  required
                />
              </div>
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="lastName">
                  Last name <span className="required">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="family-name"
                  value={formFields.lastName}
                  onChange={onChangeInput}
                  required
                />
              </div>
            </div>

            <p className="checkout-page__fieldset-label">
              Street address <span className="required">*</span>
            </p>
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
                  required
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
                  Town / City <span className="required">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="checkout-page__input"
                  autoComplete="address-level2"
                  value={formFields.city}
                  onChange={onChangeInput}
                  required
                />
              </div>
            </div>

            <div className="checkout-page__row checkout-page__row--half">
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="phoneNumber">
                  Phone <span className="required">*</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="checkout-page__input"
                  autoComplete="tel"
                  value={formFields.phoneNumber}
                  onChange={onChangeInput}
                  required
                />
              </div>
              <div className="checkout-page__field">
                <label className="checkout-page__label" htmlFor="email">
                  Email address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="checkout-page__input"
                  autoComplete="email"
                  value={formFields.email}
                  onChange={onChangeInput}
                  required
                />
              </div>
            </div>

            <label className="checkout-page__checkbox">
              <input
                type="checkbox"
                checked={shipToDifferent}
                onChange={(e) => setShipToDifferent(e.target.checked)}
              />
              Ship to a different address?
            </label>

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

              <label className="checkout-page__payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                <span className="checkout-page__payment-label">Direct bank transfer</span>
                {paymentMethod === "bank_transfer" && (
                  <p className="checkout-page__payment-hint">
                    You will be redirected to complete payment securely.
                  </p>
                )}
              </label>
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
