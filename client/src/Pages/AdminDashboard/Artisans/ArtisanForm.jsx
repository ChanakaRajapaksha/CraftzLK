import { useState } from "react";
import ProductImageUploadField from "../../../Components/AdminDashboard/ProductImageUploadField";
import { ARTISAN_FORM_TABS, slugify } from "./artisanFormDefaults";

function Field({ label, htmlFor, children, full = false, size = "default", required = false }) {
  const sizeClass = size === "full" || full
    ? " admin-dash__field--full"
    : size === "short"
      ? " admin-dash__field--short"
      : "";

  return (
    <div className={`admin-dash__field${sizeClass}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="admin-dash__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export default function ArtisanForm({
  formFields,
  setFormFields,
  previews,
  setPreviews,
  setAlertBox,
  isEdit = false,
  isLoading = false,
  submitLabel = "Save artisan",
  variant = "page",
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const onNameChange = (e) => {
    const name = e.target.value;
    setFormFields((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
    }));
  };

  const changeSocial = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Artisan name is required." });
      setTab("basic");
      return;
    }
    if (!formFields.location?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Location is required." });
      setTab("basic");
      return;
    }
    onSubmit(e);
  };

  return (
    <form
      id={variant === "modal" ? "artisan-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <nav className="admin-dash__product-tabs" aria-label="Artisan form sections">
        {ARTISAN_FORM_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-dash__product-tab${tab === item.id ? " admin-dash__product-tab--active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="admin-dash__panel admin-dash__product-panel">
        {tab === "basic" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Artisan Name" htmlFor="name" full required>
              <input
                className="admin-dash__input"
                id="name"
                name="name"
                value={formFields.name}
                onChange={onNameChange}
                placeholder="e.g. Nimal Handcraft Studio"
              />
            </Field>
            <Field label="Location" htmlFor="location" required>
              <input
                className="admin-dash__input"
                id="location"
                name="location"
                value={formFields.location}
                onChange={changeInput}
                placeholder="e.g. Kandy, Sri Lanka"
              />
            </Field>
            <Field label="Status" htmlFor="status" size="short">
              <select className="admin-dash__select" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <div className="admin-dash__field admin-dash__field--full">
              <p className="admin-dash__artisan-preview-hint">
                <strong>Created by:</strong> {formFields.name || "Artisan name"}
                <br />
                <strong>About:</strong> {formFields.bio || "Short bio will appear on product pages."}
              </p>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="admin-dash__product-images-tab">
            <Field label="Profile Image" full>
              <ProductImageUploadField
                uploadEndpoint="/api/artisans/upload"
                deleteImageEndpoint="/api/artisans/deleteImage"
                previews={previews}
                setPreviews={setPreviews}
                setAlertBox={setAlertBox}
                clearStagingOnMount={!isEdit}
                mainImageTitle="Profile Image"
                mainImageDescription="This image represents the artisan in listings and on product pages."
                galleryTitle="Uploaded Images"
                galleryDescription="Drag to reorder. The first image is used as the profile photo."
                emptyMessage="No profile image uploaded yet. You can add one anytime."
                entityLabel="artisan"
                uploadHint="JPG, PNG, WebP · Profile photo recommended"
              />
            </Field>
          </div>
        )}

        {tab === "about" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Bio" htmlFor="bio" full>
              <textarea
                className="admin-dash__textarea admin-dash__textarea--sm"
                id="bio"
                name="bio"
                value={formFields.bio}
                onChange={changeInput}
                placeholder="Traditional wooden crafts maker"
              />
            </Field>
            <Field label="Story" htmlFor="story" full>
              <textarea
                className="admin-dash__textarea"
                id="story"
                name="story"
                value={formFields.story}
                onChange={changeInput}
                placeholder="Tell the artisan's story — heritage, techniques, and what makes their work special."
              />
            </Field>
          </div>
        )}

        {tab === "social" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Website" htmlFor="social-website">
              <input
                className="admin-dash__input"
                id="social-website"
                value={formFields.social?.website}
                onChange={(e) => changeSocial("website", e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
            <Field label="Facebook" htmlFor="social-facebook">
              <input
                className="admin-dash__input"
                id="social-facebook"
                value={formFields.social?.facebook}
                onChange={(e) => changeSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </Field>
            <Field label="Instagram" htmlFor="social-instagram">
              <input
                className="admin-dash__input"
                id="social-instagram"
                value={formFields.social?.instagram}
                onChange={(e) => changeSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </Field>
            <Field label="Twitter / X" htmlFor="social-twitter">
              <input
                className="admin-dash__input"
                id="social-twitter"
                value={formFields.social?.twitter}
                onChange={(e) => changeSocial("twitter", e.target.value)}
                placeholder="https://x.com/..."
              />
            </Field>
          </div>
        )}

        <div className="admin-dash__product-form-actions">
          {variant !== "modal" && (
            <button type="submit" className="admin-dash__btn" disabled={isLoading}>
              {isLoading ? "Saving…" : submitLabel}
            </button>
          )}
        </div>
      </section>
    </form>
  );
}
