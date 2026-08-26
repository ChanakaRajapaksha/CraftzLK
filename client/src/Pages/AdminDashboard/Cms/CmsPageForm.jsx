import { useState } from "react";
import ProductImageUploadField from "../../../Components/AdminDashboard/ProductImageUploadField";
import { CMS_FORM_TABS, CMS_COMING_SOON_HINT, getPagePath, isReservedCmsSlug, slugify } from "./cmsFormDefaults";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function CmsPageForm({
  formFields,
  setFormFields,
  previews,
  setPreviews,
  setAlertBox,
  isEdit = false,
  isLoading = false,
  submitLabel = "Save page",
  variant = "page",
  onSubmit,
}) {
  const isSystem = formFields.pageType === "system";
  const visibleTabs = isSystem
    ? CMS_FORM_TABS.filter((item) => item.id !== "images")
    : CMS_FORM_TABS;
  const [tab, setTab] = useState("title");

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const onTitleChange = (e) => {
    const title = e.target.value;
    setFormFields((prev) => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
      seo: {
        ...prev.seo,
        metaTitle: prev.seo?.metaTitle || title,
      },
    }));
  };

  const changeNested = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.title?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Page title is required." });
      setTab("title");
      return;
    }
    if (!formFields.slug?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "URL slug is required." });
      setTab("title");
      return;
    }
    if (isReservedCmsSlug(formFields.slug)) {
      setAlertBox?.({
        open: true,
        error: true,
        msg: "That slug is reserved for a built-in storefront page. Choose a different slug.",
      });
      setTab("title");
      return;
    }
    onSubmit(e);
  };

  return (
    <form
      id={variant === "modal" ? "cms-page-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <nav className="admin-dash__product-tabs" aria-label="CMS page form sections">
        {visibleTabs.map((item) => (
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
        {tab === "title" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Title" htmlFor="title" full>
              <input
                className="admin-dash__input"
                id="title"
                name="title"
                value={formFields.title}
                onChange={onTitleChange}
                placeholder="Craftz stories"
              />
            </Field>
            <Field label="URL slug" htmlFor="slug">
              <input
                className="admin-dash__input"
                id="slug"
                name="slug"
                value={formFields.slug}
                onChange={changeInput}
                placeholder="craft-stories"
                readOnly={isSystem}
                disabled={isSystem}
              />
            </Field>
            {isSystem && (
              <Field label="Storefront route" htmlFor="routePath">
                <input
                  className="admin-dash__input"
                  id="routePath"
                  value={formFields.routePath || getPagePath(formFields)}
                  readOnly
                  disabled
                />
              </Field>
            )}
            <Field label="Status" htmlFor="status">
              <select
                className="admin-dash__select admin-dash__select--compact"
                id="status"
                name="status"
                value={formFields.status}
                onChange={changeInput}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Show in header nav" htmlFor="showInNav">
              <select
                className="admin-dash__select admin-dash__select--compact"
                id="showInNav"
                name="showInNav"
                value={formFields.showInNav ? "yes" : "no"}
                onChange={(e) =>
                  setFormFields((prev) => ({
                    ...prev,
                    showInNav: e.target.value === "yes",
                  }))
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            <div className="admin-dash__field admin-dash__field--full">
              {isSystem ? (
                <p className="admin-dash__hint">
                  Built-in page — layout is managed by the existing frontend design. You can update the title, nav visibility, status, and SEO here.
                </p>
              ) : (
                <>
                  <p className="admin-dash__hint">
                    Examples: <code>about</code>, <code>contact</code>, <code>craft-stories</code>, <code>shipping-info</code>
                  </p>
                  <p className="admin-dash__hint">
                    Slugs reserved for built-in pages: Home, Shop, Categories, Gifts, and Eco.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "content" && (
          <>
            <Field label="Content" htmlFor="content" full>
              <textarea
                className="admin-dash__textarea admin-dash__textarea--cms"
                id="content"
                name="content"
                rows={variant === "modal" ? 12 : 16}
                value={formFields.content}
                onChange={changeInput}
                placeholder="Write the page body content. HTML or plain text is supported."
              />
            </Field>
            {!isEdit && !isSystem && (
              <p className="admin-dash__hint admin-dash__hint--cms">{CMS_COMING_SOON_HINT}</p>
            )}
            {isSystem && (
              <p className="admin-dash__hint admin-dash__hint--cms">
                This summary describes the built-in page for admin reference. The live layout comes from the frontend page design.
              </p>
            )}
          </>
        )}

        {tab === "images" && (
          <div className="admin-dash__product-images-tab">
            <Field label="Page images" full>
              <ProductImageUploadField
                uploadEndpoint="/api/cms-pages/upload"
                deleteImageEndpoint="/api/cms-pages/deleteImage"
                previews={previews}
                setPreviews={setPreviews}
                setAlertBox={setAlertBox}
                clearStagingOnMount={!isEdit}
                mainImageTitle="Hero / banner image"
                mainImageDescription="Optional featured image for the top of this static page."
                galleryTitle="Page gallery"
                galleryDescription="Additional images used within the page content or sidebar."
                emptyMessage="No images uploaded yet. Add optional page images."
                entityLabel="page"
                uploadHint="JPG, PNG, WebP · Multiple files supported"
              />
            </Field>
          </div>
        )}

        {tab === "seo" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Meta title" htmlFor="seo-metaTitle" full>
              <input
                className="admin-dash__input"
                id="seo-metaTitle"
                value={formFields.seo?.metaTitle}
                onChange={(e) => changeNested("metaTitle", e.target.value)}
                placeholder="Craft Stories | CraftzLK"
              />
            </Field>
            <Field label="Meta description" htmlFor="seo-metaDescription" full>
              <textarea
                className="admin-dash__textarea"
                id="seo-metaDescription"
                rows={4}
                value={formFields.seo?.metaDescription}
                onChange={(e) => changeNested("metaDescription", e.target.value)}
                placeholder="Short description for search engines…"
              />
            </Field>
            <Field label="Keywords" htmlFor="seo-keywords" full>
              <input
                className="admin-dash__input"
                id="seo-keywords"
                value={formFields.seo?.keywords}
                onChange={(e) => changeNested("keywords", e.target.value)}
                placeholder="about, handmade, sri lanka"
              />
            </Field>
          </div>
        )}

        {variant !== "modal" && (
          <div className="admin-dash__product-form-actions">
            <button type="submit" className="admin-dash__btn" disabled={isLoading}>
              {isLoading ? "Saving…" : submitLabel}
            </button>
          </div>
        )}
      </section>
    </form>
  );
}
