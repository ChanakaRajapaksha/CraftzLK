import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { deleteData, editData, fetchDataFromApi, postData } from "../../../utils/api";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import ArtisanForm from "./ArtisanForm";
import { artisanToForm, defaultArtisanFields, formToPayload } from "./artisanFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function ArtisanFormModal({
  open,
  artisanId = null,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const isEdit = Boolean(artisanId);
  const [formFields, setFormFields] = useState({ ...defaultArtisanFields });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${artisanId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultArtisanFields });
      setPreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDataFromApi(`/api/artisans/${artisanId}`)
      .then((res) => {
        const artisan = res?.artisan || res?.artisanData?.[0];
        if (artisan) {
          setFormFields(artisanToForm(artisan));
          setPreviews(artisan.images || []);
        } else {
          setAlertBox?.({ open: true, error: true, msg: "Artisan not found." });
          onClose?.();
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load artisan." });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = formToPayload(formFields, previews);
    const request = isEdit
      ? editData(`/api/artisans/${artisanId}`, payload)
      : postData("/api/artisans/create", payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update artisan." : "Failed to publish artisan."),
          });
          return;
        }

        deleteData("/api/imageUpload/deleteAllImages").catch(() => {});
        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Artisan updated." : "Artisan published.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update artisan." : "Failed to publish artisan.");
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
        className="admin-dash__settings-modal admin-dash__settings-modal--artisans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artisan-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Artisan Management</p>
            <h2 id="artisan-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit artisan" : "Add artisan"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update profile, story, social links, and Cloudinary-hosted images."
                : "Add a maker or studio featured on your handmade marketplace."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close artisan form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading artisan…" compact />
          ) : (
            <ArtisanForm
              formFields={formFields}
              setFormFields={setFormFields}
              previews={previews}
              setPreviews={setPreviews}
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
              form="artisan-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update artisan" : "Publish artisan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
