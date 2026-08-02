import {
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoTicketOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaTag } from "react-icons/fa";
import { MdBlock } from "react-icons/md";

function FeedbackIcon({ reason, type }) {
  if (type === "success") return <IoCheckmarkCircle aria-hidden="true" />;
  if (reason === "expired") return <IoTimeOutline aria-hidden="true" />;
  if (reason === "usage_limit") return <MdBlock aria-hidden="true" />;
  if (reason === "inactive" || reason === "min_order") return <IoAlertCircleOutline aria-hidden="true" />;
  return <IoCloseCircleOutline aria-hidden="true" />;
}

export default function CheckoutCouponSection({
  appliedCoupon,
  couponCode,
  couponFeedback,
  couponApplying,
  applyDisabled,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  if (appliedCoupon) {
    return (
      <div className="checkout-page__coupon checkout-page__coupon--applied">
        <div className="checkout-page__coupon-head">
          <FaTag className="checkout-page__coupon-head-icon" aria-hidden="true" />
          <span>Coupon applied</span>
        </div>

        <div className="checkout-page__coupon-applied-card">
          <div className="checkout-page__coupon-applied-main">
            <IoTicketOutline className="checkout-page__coupon-applied-icon" aria-hidden="true" />
            <div>
              <strong className="checkout-page__coupon-applied-code">{appliedCoupon.code}</strong>
              <span className="checkout-page__coupon-applied-label">{appliedCoupon.discountLabel}</span>
            </div>
          </div>

          <div className="checkout-page__coupon-applied-success">
            <IoCheckmarkCircle aria-hidden="true" />
            <div>
              <p className="checkout-page__coupon-applied-message">{appliedCoupon.message}</p>
              {appliedCoupon.successDetail && (
                <p className="checkout-page__coupon-applied-detail">{appliedCoupon.successDetail}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="checkout-page__coupon-remove"
            onClick={onRemoveCoupon}
          >
            Remove coupon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page__coupon">
      <div className="checkout-page__coupon-head">
        <FaTag className="checkout-page__coupon-head-icon" aria-hidden="true" />
        <span>Have a coupon?</span>
      </div>

      <div className="checkout-page__coupon-field-wrap">
        <IoTicketOutline className="checkout-page__coupon-input-icon" aria-hidden="true" />
        <input
          id="checkout-coupon-code"
          type="text"
          className={`checkout-page__coupon-input${
            couponFeedback?.type === "error" ? " checkout-page__coupon-input--error" : ""
          }`}
          placeholder="Enter coupon code"
          aria-label="Enter coupon code"
          value={couponCode}
          onChange={onCouponCodeChange}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <button
        type="button"
        className="checkout-page__coupon-apply"
        onClick={onApplyCoupon}
        disabled={applyDisabled}
      >
        {couponApplying ? "Applying…" : "Apply coupon"}
      </button>

      {couponFeedback && (
        <div
          className={`checkout-page__coupon-feedback checkout-page__coupon-feedback--${couponFeedback.type}`}
          role="status"
          aria-live="polite"
        >
          <FeedbackIcon reason={couponFeedback.reason} type={couponFeedback.type} />
          <div>
            <p className="checkout-page__coupon-feedback-message">{couponFeedback.message}</p>
            {couponFeedback.subMessage && (
              <p className="checkout-page__coupon-feedback-sub">{couponFeedback.subMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
