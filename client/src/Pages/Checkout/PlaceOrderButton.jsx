import "./PlaceOrderButton.css";

const CHECKMARK_PATH = "M2 6 L5 9 L12 2";

function DeliveryVan() {
  return (
    <svg
      className="place-order-btn__van-svg"
      viewBox="0 0 112 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="56" cy="40" rx="34" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <rect x="34" y="12" width="52" height="24" rx="2" fill="#f4f4f2" />
      <rect x="34" y="12" width="52" height="24" rx="2" stroke="#c8c8c4" strokeWidth="0.8" />
      <rect x="36" y="14" width="48" height="3" rx="1" fill="#d94f2b" opacity="0.9" />
      <path d="M86 16 H98 C101 16 103 18 103 21 V34 H86 Z" fill="#2f5fae" />
      <path d="M88 18 H97 C99 18 100 19 100 21 V22 H88 Z" fill="#9ec5ff" opacity="0.85" />
      <rect x="86" y="28" width="17" height="8" rx="1" fill="#244a8f" />
      <rect x="38" y="19" width="14" height="14" rx="1" fill="#e8e8e4" stroke="#bbb" strokeWidth="0.6" />
      <line x1="45" y1="19" x2="45" y2="33" stroke="#bbb" strokeWidth="0.6" />
      <line x1="38" y1="26" x2="52" y2="26" stroke="#bbb" strokeWidth="0.6" />
      <circle cx="46" cy="36" r="4.5" fill="#1a1a1a" />
      <circle cx="46" cy="36" r="2" fill="#666" />
      <circle cx="92" cy="36" r="4.5" fill="#1a1a1a" />
      <circle cx="92" cy="36" r="2" fill="#666" />
      <rect x="54" y="19" width="10" height="8" rx="1" className="place-order-btn__cargo-slot place-order-btn__cargo-slot--1" />
      <rect x="66" y="19" width="10" height="8" rx="1" className="place-order-btn__cargo-slot place-order-btn__cargo-slot--2" />
      <rect x="54" y="29" width="10" height="6" rx="1" className="place-order-btn__cargo-slot place-order-btn__cargo-slot--3" />
    </svg>
  );
}

function Package({ className }) {
  return (
    <span className={`place-order-btn__package ${className}`} aria-hidden="true">
      <span className="place-order-btn__package-face" />
    </span>
  );
}

export default function PlaceOrderButton({ phase = "idle", disabled, onClick, type = "submit" }) {
  const isLoading = phase === "loading";
  const isSuccess = phase === "success";
  const isIdle = phase === "idle";

  return (
    <button
      type={type}
      className={`place-order-btn checkout-page__submit${isLoading ? " place-order-btn--loading" : ""}${
        isSuccess ? " place-order-btn--success" : ""
      }`}
      disabled={disabled || isLoading || isSuccess}
      onClick={onClick}
      aria-live="polite"
      aria-busy={isLoading}
    >
      <span className="place-order-btn__sizer" aria-hidden="true">
        Place order
      </span>

      {isIdle && (
        <span className="place-order-btn__label place-order-btn__label--default">Place order</span>
      )}

      {isLoading && (
        <span className="place-order-btn__scene">
          <span className="place-order-btn__loading-caption">Loading your order…</span>
          <span className="place-order-btn__stage">
            <span className="place-order-btn__sky" />
            <span className="place-order-btn__road">
              <span className="place-order-btn__road-edge place-order-btn__road-edge--top" />
              <span className="place-order-btn__road-markings" />
            </span>

            <span className="place-order-btn__pickup-area">
              <Package className="place-order-btn__package--1" />
              <Package className="place-order-btn__package--2" />
              <Package className="place-order-btn__package--3" />
            </span>

            <span className="place-order-btn__van-wrap">
              <DeliveryVan />
            </span>
          </span>
        </span>
      )}

      {isSuccess && (
        <span className="place-order-btn__label place-order-btn__label--success">
          Order placed
          <svg viewBox="0 0 14 11" aria-hidden="true">
            <path d={CHECKMARK_PATH} />
          </svg>
        </span>
      )}
    </button>
  );
}
