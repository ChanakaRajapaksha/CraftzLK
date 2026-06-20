import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { formToPayload } from "./promoBannerFormDefaults";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function PromoBannerForm({
  formFields,
  setFormFields,
  desktopPreviews,
  setDesktopPreviews,
  mobilePreviews,
  setMobilePreviews,
  setAlertBox,
  isLoading = false,
  isEdit = false,
  submitLabel = "Save banner",
  onSubmit,
}) {
  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.heading?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Heading is required." });
      return;
    }
    const desktopImage = desktopPreviews[0] || "";
    const mobileImage = mobilePreviews[0] || "";
    if (!desktopImage && !mobileImage) {
      setAlertBox?.({ open: true, error: true, msg: "Upload at least one banner image." });
      return;
    }
    onSubmit(e, formToPayload(formFields, desktopImage, mobileImage));
  };

  return (
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
      <section className="admin-dash__panel admin-dash__product-panel">
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <Field label="Heading" htmlFor="heading" full>
            <input
              className="admin-dash__input"
              id="heading"
              name="heading"
              value={formFields.heading}
              onChange={changeInput}
              placeholder="New Handmade Collection"
            />
          </Field>
          <Field label="Description" htmlFor="description" full>
            <textarea
              className="admin-dash__textarea"
              id="description"
              name="description"
              rows={3}
              value={formFields.description}
              onChange={changeInput}
              placeholder="Discover fresh artisan pieces crafted across Sri Lanka."
            />
          </Field>
          <Field label="Button Text" htmlFor="buttonText">
            <input className="admin-dash__input" id="buttonText" name="buttonText" value={formFields.buttonText} onChange={changeInput} placeholder="Shop Now" />
          </Field>
          <Field label="Button URL" htmlFor="buttonUrl">
            <input className="admin-dash__input" id="buttonUrl" name="buttonUrl" value={formFields.buttonUrl} onChange={changeInput} placeholder="/collections" />
          </Field>
          <Field label="Display Order" htmlFor="displayOrder">
            <input className="admin-dash__input" id="displayOrder" name="displayOrder" type="number" min="0" value={formFields.displayOrder} onChange={changeInput} placeholder="1" />
          </Field>
          <Field label="Status" htmlFor="status">
            <select className="admin-dash__select admin-dash__select--compact" id="status" name="status" value={formFields.status} onChange={changeInput}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Desktop Image">
            <div className="admin-dash__banner-upload-wrap">
              <ImageUploadField
                uploadEndpoint="/api/home-slider-banners/upload"
                deleteImageEndpoint="/api/home-slider-banners/deleteImage"
                previews={desktopPreviews}
                setPreviews={setDesktopPreviews}
                setAlertBox={setAlertBox}
                multiple={false}
                maxImages={1}
                clearStagingOnMount={!isEdit}
              />
            </div>
          </Field>
          <Field label="Mobile Image">
            <div className="admin-dash__banner-upload-wrap">
              <ImageUploadField
                uploadEndpoint="/api/home-slider-banners/upload"
                deleteImageEndpoint="/api/home-slider-banners/deleteImage"
                previews={mobilePreviews}
                setPreviews={setMobilePreviews}
                setAlertBox={setAlertBox}
                multiple={false}
                maxImages={1}
                clearStagingOnMount={false}
              />
            </div>
          </Field>
        </div>

        <div className="admin-dash__product-form-actions">
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : submitLabel}
          </button>
        </div>
      </section>
    </form>
  );
}
