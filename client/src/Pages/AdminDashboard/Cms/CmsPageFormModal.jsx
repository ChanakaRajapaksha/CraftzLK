import { useState } from "react";
import { IoClose } from "react-icons/io5";
import CmsController from "../../../controllers/cms.controller.js";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import CmsPageForm from "./CmsPageForm";
import { defaultCmsPageFields, formToPayload, pageToForm } from "./cmsFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function CmsPageFormModal({
  open,
  pageId = null,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const isEdit = Boolean(pageId);
  const [formFields, setFormFields] = useState({ ...defaultCmsPageFields });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sessionKey = isEdit ? `edit:${pageId}` : "add";

  useModalBodyLock(open, onClose);

  useModalFormInit(open, sessionKey, () => {
    if (!isEdit) {
      setFormFields({ ...defaultCmsPageFields });
      setPreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    CmsController.getById(pageId)
      .then((res) => {
        if (res?.success === false || !res?.title) {
          setAlertBox?.({ open: true, error: true, msg: "Page not found." });
          onClose?.();
          return;
        }
        setFormFields(pageToForm(res));
        setPreviews(res.images || []);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load page." });
        onClose?.();
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = formToPayload(formFields, previews);
    const request = isEdit
      ? CmsController.update(pageId, payload)
      : CmsController.create(payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || (isEdit ? "Failed to update page." : "Failed to publish page."),
          });
          return;
        }

        ImageUploadController.clearStagingImages().catch(() => {});
        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Page updated." : "Page published.",
        });
        onSaved?.(res);
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update page." : "Failed to publish page.");
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
        className="admin-dash__settings-modal admin-dash__settings-modal--cms"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">CMS Pages</p>
            <h2 id="cms-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit page" : "Add page"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update title, content, visibility, and SEO for this storefront page."
                : "Create a new storefront page. Empty content shows as Coming Soon until you add copy."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close page form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading page…" compact />
          ) : (
            <CmsPageForm
              formFields={formFields}
              setFormFields={setFormFields}
              previews={previews}
              setPreviews={setPreviews}
              setAlertBox={setAlertBox}
              isEdit={isEdit}
              isLoading={saving}
              variant="modal"
              submitLabel={isEdit ? "Update page" : "Publish page"}
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
              form="cms-page-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update page" : "Publish page"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
