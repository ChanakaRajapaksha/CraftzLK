import { useState } from "react";
import ProductImageUploadField from "../../../Components/AdminDashboard/ProductImageUploadField";
import { categoryEndpoints } from "../../../api/endpoint.js";
import { CATEGORY_FORM_TABS, slugify } from "./categoryFormDefaults";

function Field({ label, htmlFor, children, full = false, required = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
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

export default function CategoryForm({
  formFields,
  setFormFields,
  previews,
  setPreviews,
  catData,
  setAlertBox,
  isEdit = false,
  isLoading = false,
  submitLabel = "Save category",
  variant = "page",
  onSubmit,
  lockParent = false,
}) {
  const [tab, setTab] = useState("basic");

  const mainCategories = (catData?.categoryList || []).filter((cat) => !cat.parentId);

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
      seo: {
        ...prev.seo,
        metaTitle: prev.seo?.metaTitle || name,
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
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Category name is required." });
      setTab("basic");
      return;
    }
    onSubmit(e);
  };

  return (
    <form
      id={variant === "modal" ? "category-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <nav className="admin-dash__product-tabs" aria-label="Category form sections">
        {CATEGORY_FORM_TABS.map((item) => (
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
            <Field label="Category Name" htmlFor="name" full required>
              <input
                className="admin-dash__input"
                id="name"
                name="name"
                value={formFields.name}
                onChange={onNameChange}
                placeholder="e.g. Fashion"
                required
                aria-required="true"
              />
            </Field>
            <Field label="Parent Category" htmlFor="parentId">
              <select
                className="admin-dash__select"
                id="parentId"
                name="parentId"
                value={formFields.parentId}
                onChange={changeInput}
                disabled={lockParent}
              >
                <option value="">None (Main category)</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Status" htmlFor="status">
              <select className="admin-dash__select" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <div className="admin-dash__field admin-dash__field--full">
              <p className="admin-dash__category-tree-hint">
                Example hierarchy: Fashion → Handmade Bags, Jewelry
              </p>
            </div>
          </div>
        )}

        {tab === "images" && (
          <div className="admin-dash__product-images-tab">
            <Field label="Category Image" full>
              <ProductImageUploadField
                uploadEndpoint={categoryEndpoints.upload}
                deleteImageEndpoint={categoryEndpoints.deleteImage}
                previews={previews}
                setPreviews={setPreviews}
                setAlertBox={setAlertBox}
                clearStagingOnMount={!isEdit}
                mainImageTitle="Category Image"
                mainImageDescription="This image is shown in category listings, navigation, and shop pages."
                galleryTitle="Uploaded Images"
                galleryDescription="Drag to reorder. The first image is used as the category image."
                emptyMessage="No images uploaded yet. You can add a category image optionally."
                entityLabel="category"
                uploadHint="JPG, PNG, WebP · Multiple files supported"
              />
            </Field>
          </div>
        )}

        {tab === "description" && (
          <Field label="Description" htmlFor="description" full>
            <textarea
              className="admin-dash__textarea"
              id="description"
              name="description"
              value={formFields.description}
              onChange={changeInput}
              placeholder="Describe this category for customers and admins."
            />
          </Field>
        )}

        {tab === "seo" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Meta Title" htmlFor="seo-metaTitle" full>
              <input
                className="admin-dash__input"
                id="seo-metaTitle"
                value={formFields.seo?.metaTitle}
                onChange={(e) => changeNested("metaTitle", e.target.value)}
              />
            </Field>
            <Field label="URL Slug" htmlFor="slug">
              <input className="admin-dash__input" id="slug" name="slug" value={formFields.slug} onChange={changeInput} />
            </Field>
            <Field label="Meta Description" htmlFor="seo-metaDescription" full>
              <textarea
                className="admin-dash__textarea"
                id="seo-metaDescription"
                value={formFields.seo?.metaDescription}
                onChange={(e) => changeNested("metaDescription", e.target.value)}
              />
            </Field>
            <Field label="Keywords" htmlFor="seo-keywords" full>
              <input
                className="admin-dash__input"
                id="seo-keywords"
                value={formFields.seo?.keywords}
                onChange={(e) => changeNested("keywords", e.target.value)}
                placeholder="fashion, handmade, jewelry"
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
