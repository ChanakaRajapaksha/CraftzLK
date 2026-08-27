import { useState } from "react";
import { IoClose } from "react-icons/io5";
import CouponController from "../../../controllers/coupon.controller.js";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import CouponForm from "./CouponForm";
import { couponFromRecord, defaultCouponFields, formToPayload } from "./couponFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function CouponFormModal({
  open,
  couponId = null,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const isEdit = Boolean(couponId);
  const [formFields, setFormFields] = useState({ ...defaultCouponFields });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${couponId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultCouponFields });
      setLoading(false);
      return;
    }

    setLoading(true);
    CouponController.getById(couponId)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({ open: true, error: true, msg: res?.message || "Coupon not found." });
          onClose?.();
          return;
        }
        if (res) {
          setFormFields(couponFromRecord(res));
        } else {
          setAlertBox?.({ open: true, error: true, msg: "Coupon not found." });
          onClose?.();
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load coupon." });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e, payloadFromForm) => {
    e.preventDefault();
    setSaving(true);

    const payload = payloadFromForm || formToPayload(formFields);
    const request = isEdit
      ? CouponController.update(couponId, payload)
      : CouponController.create( payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update coupon." : "Failed to create coupon."),
          });
          return;
        }

        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Coupon updated." : "Coupon created.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update coupon." : "Failed to create coupon.");
        setAlertBox?.({ open: true, error: true, msg: message });
      })
      .finally(() => setSaving(false));
  };

  if (!open) return null;

  return (
    <div
      className="admin-dash__settings-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dash__settings-modal admin-dash__settings-modal--categories"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Promotions & Marketing</p>
            <h2 id="coupon-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit coupon" : "Add coupon"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update discount code, rules, usage limits, and validity dates."
                : "Create a discount code for checkout and marketing campaigns."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close coupon form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading coupon…" compact />
          ) : (
            <CouponForm
              formFields={formFields}
              setFormFields={setFormFields}
              setAlertBox={setAlertBox}
              isLoading={saving}
              variant="modal"
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {!loading && (
          <div className="admin-dash__settings-modal-foot">
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update coupon" : "Create coupon"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
