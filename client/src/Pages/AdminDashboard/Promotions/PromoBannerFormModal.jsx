import { useState } from "react";
import { IoClose } from "react-icons/io5";
import BannerController from "../../../controllers/banner.controller.js";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import PromoBannerForm from "./PromoBannerForm";
import {
  bannerFromRecord,
  defaultPromoBannerFields,
  formToPayload,
} from "./promoBannerFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function PromoBannerFormModal({
  open,
  bannerId = null,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const isEdit = Boolean(bannerId);
  const [formFields, setFormFields] = useState({ ...defaultPromoBannerFields });
  const [desktopPreviews, setDesktopPreviews] = useState([]);
  const [mobilePreviews, setMobilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${bannerId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultPromoBannerFields });
      setDesktopPreviews([]);
      setMobilePreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    BannerController.getHomeSliderById(bannerId)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Banner not found.",
          });
          onClose?.();
          return;
        }
        if (res) {
          setFormFields(bannerFromRecord(res));
          setDesktopPreviews(res.desktopImage ? [res.desktopImage] : []);
          setMobilePreviews(res.mobileImage ? [res.mobileImage] : []);
        } else {
          setAlertBox?.({ open: true, error: true, msg: "Banner not found." });
          onClose?.();
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load banner." });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e, payloadFromForm) => {
    e.preventDefault();
    setSaving(true);

    const desktopImage = desktopPreviews[0] || "";
    const mobileImage = mobilePreviews[0] || "";
    const payload =
      payloadFromForm || formToPayload(formFields, desktopImage, mobileImage);

    const request = isEdit
      ? BannerController.updateHomeSlider(bannerId, payload)
      : BannerController.createHomeSlider( payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update banner." : "Failed to create banner."),
          });
          return;
        }

        ImageUploadController.clearStagingImages();
        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Banner updated." : "Banner published.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update banner." : "Failed to create banner.");
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
        aria-labelledby="promo-banner-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Promotions & Marketing</p>
            <h2
              id="promo-banner-form-modal-title"
              className="admin-dash__settings-modal-title"
            >
              {isEdit ? "Edit banner" : "Add banner"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update homepage slider content, images, link, and display order."
                : "Create a homepage slider banner with desktop and mobile images."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close banner form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading banner…" compact />
          ) : (
            <PromoBannerForm
              formFields={formFields}
              setFormFields={setFormFields}
              desktopPreviews={desktopPreviews}
              setDesktopPreviews={setDesktopPreviews}
              mobilePreviews={mobilePreviews}
              setMobilePreviews={setMobilePreviews}
              setAlertBox={setAlertBox}
              isLoading={saving}
              isEdit={isEdit}
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
              form="promo-banner-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update banner" : "Publish banner"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
