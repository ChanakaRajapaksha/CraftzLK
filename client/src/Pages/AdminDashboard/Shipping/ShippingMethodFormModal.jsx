import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { editData, fetchDataFromApi, postData } from "../../../utils/api";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import ShippingMethodForm from "./ShippingMethodForm";
import {
  defaultShippingMethodFields,
  formToPayload,
  methodFromRecord,
} from "./shippingFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function ShippingMethodFormModal({
  open,
  methodId = null,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const isEdit = Boolean(methodId);
  const [formFields, setFormFields] = useState({ ...defaultShippingMethodFields });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${methodId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultShippingMethodFields });
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDataFromApi(`/api/shipping-methods/${methodId}`)
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Shipping method not found.",
          });
          onClose?.();
          return;
        }
        setFormFields(methodFromRecord(res));
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load shipping method." });
        onClose?.();
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e, payloadFromForm) => {
    e.preventDefault();
    setSaving(true);

    const payload = payloadFromForm || formToPayload(formFields);
    const request = isEdit
      ? editData(`/api/shipping-methods/${methodId}`, payload)
      : postData("/api/shipping-methods/create", payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update shipping method." : "Failed to create shipping method."),
          });
          return;
        }

        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Shipping method updated." : "Shipping method created.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update shipping method." : "Failed to create shipping method.");
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
        aria-labelledby="shipping-method-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Shipping Management</p>
            <h2 id="shipping-method-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit shipping method" : "Add shipping method"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update delivery name, cost, zones, and availability for checkout."
                : "Configure a delivery option with cost, delivery time, and shipping zones."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close shipping method form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading shipping method…" compact />
          ) : (
            <ShippingMethodForm
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
              form="shipping-method-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update method" : "Create method"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
