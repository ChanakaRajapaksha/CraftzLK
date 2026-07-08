import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { deleteData, editData, fetchDataFromApi, postData } from "../../../utils/api";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import ProductForm from "./ProductForm";
import {
  defaultProductFields,
  formToPayload,
  productToForm,
} from "./productFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

function isValidProduct(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      !data.response &&
      !data.message?.includes?.("not found") &&
      (data._id || data.id || data.name)
  );
}

export default function ProductFormModal({
  open,
  productId = null,
  onClose,
  onSaved,
  setAlertBox,
  catData,
}) {
  const isEdit = Boolean(productId);
  const [formFields, setFormFields] = useState({ ...defaultProductFields });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${productId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultProductFields });
      setPreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDataFromApi(`/api/products/${productId}`)
      .then((res) => {
        if (isValidProduct(res)) {
          setFormFields(productToForm(res));
          setPreviews(res.images || []);
        } else {
          setAlertBox?.({ open: true, error: true, msg: "Product not found." });
          onClose?.();
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load product." });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = formToPayload(formFields);
    const request = isEdit
      ? editData(`/api/products/${productId}`, { ...payload, images: previews })
      : postData("/api/products/create", payload);

    request
      .then((res) => {
        if (isEdit) {
          if (res?.status === false) {
            setAlertBox?.({
              open: true,
              error: true,
              msg: res?.message || "Failed to update product.",
            });
            return;
          }
        } else if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to publish product.",
          });
          return;
        }

        deleteData("/api/imageUpload/deleteAllImages").catch(() => {});
        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Product updated." : "Product published.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update product." : "Failed to publish product.");
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
        className="admin-dash__settings-modal admin-dash__settings-modal--products"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Product Management</p>
            <h2 id="product-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit product" : "Add product"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update product details, images, pricing, inventory, variants, and SEO."
                : "Create a new handmade product for your catalog."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close product form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading product…" compact />
          ) : (
            <ProductForm
              key={sessionKey}
              formFields={formFields}
              setFormFields={setFormFields}
              previews={previews}
              setPreviews={setPreviews}
              catData={catData}
              setAlertBox={setAlertBox}
              isEdit={isEdit}
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
              form="product-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update product" : "Publish product"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
