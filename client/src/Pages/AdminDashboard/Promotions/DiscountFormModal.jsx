import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { editData, fetchDataFromApi, postData } from "../../../utils/api";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import DiscountForm from "./DiscountForm";
import {
  defaultDiscountFields,
  discountFromRecord,
  DISCOUNT_TYPES,
  formToPayload,
} from "./discountFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function DiscountFormModal({
  open,
  discountId = null,
  initialType = "",
  onClose,
  onSaved,
  setAlertBox,
  catData,
}) {
  const isEdit = Boolean(discountId);
  const [formFields, setFormFields] = useState({ ...defaultDiscountFields });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit
    ? `edit:${discountId}`
    : `add:${initialType || "product"}`;

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      const type =
        initialType && DISCOUNT_TYPES.some((item) => item.value === initialType)
          ? initialType
          : defaultDiscountFields.type;
      setFormFields({ ...defaultDiscountFields, type });
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDataFromApi(`/api/promo-discounts/${discountId}`)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({ open: true, error: true, msg: res?.message || "Discount not found." });
          onClose?.();
          return;
        }
        if (res) {
          setFormFields(discountFromRecord(res));
        } else {
          setAlertBox?.({ open: true, error: true, msg: "Discount not found." });
          onClose?.();
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load discount." });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e, payloadFromForm) => {
    e.preventDefault();
    setSaving(true);

    const payload = payloadFromForm || formToPayload(formFields);
    const request = isEdit
      ? editData(`/api/promo-discounts/${discountId}`, payload)
      : postData("/api/promo-discounts/create", payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update discount." : "Failed to create discount."),
          });
          return;
        }

        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit
            ? "Discount updated and product pricing synced."
            : "Discount created and product pricing synced.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update discount." : "Failed to create discount.");
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
        aria-labelledby="discount-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Promotions & Marketing</p>
            <h2 id="discount-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit discount" : "Create discount"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update promotion details, targets, schedule, and linked product pricing."
                : "Create a product, category, or seasonal promotion and apply pricing to targeted products."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close discount form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading discount…" compact />
          ) : (
            <DiscountForm
              formFields={formFields}
              setFormFields={setFormFields}
              catData={catData}
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
              form="discount-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update discount" : "Create discount"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
