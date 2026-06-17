import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { fetchDataFromApi } from "../../../utils/api";
import { defaultProductFields, PRODUCT_FORM_TABS, slugify } from "./productFormDefaults";

function Field({ label, htmlFor, children }) {
  return (
    <div className="admin-dash__field">
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function ProductForm({
  formFields,
  setFormFields,
  previews,
  setPreviews,
  catData,
  setAlertBox,
  isEdit = false,
  submitLabel = "Save product",
  isLoading = false,
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");
  const [subCategories, setSubCategories] = useState([]);
  const [rams, setRams] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    fetchDataFromApi("/api/productRAMS").then((res) => setRams(Array.isArray(res) ? res : []));
    fetchDataFromApi("/api/productSIZE").then((res) => setSizes(Array.isArray(res) ? res : []));
    fetchDataFromApi("/api/productWeight").then((res) => setWeights(Array.isArray(res) ? res : []));
  }, []);

  useEffect(() => {
    if (formFields.catId && catData?.categoryList) {
      const cat = catData.categoryList.find((c) => c._id === formFields.catId);
      setSubCategories(cat?.children || []);
    }
  }, [formFields.catId, catData]);

  const changeInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const changeNested = (section, field, value) => {
    setFormFields((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
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

  const onCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = catData?.categoryList?.find((c) => c._id === catId);
    setSubCategories(cat?.children || []);
    setFormFields((prev) => ({
      ...prev,
      catId,
      catName: cat?.name || "",
      category: catId,
      subCatId: "",
      subCatName: "",
      subCat: "",
    }));
  };

  const onSubCategoryChange = (e) => {
    const subCatId = e.target.value;
    const sub = subCategories.find((s) => s._id === subCatId);
    setFormFields((prev) => ({
      ...prev,
      subCatId,
      subCatName: sub?.name || "",
      subCat: sub?.name || "",
    }));
  };

  const addVariantGroup = () => {
    setFormFields((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { variantName: "", options: [{ label: "", sku: "", price: "", stock: "", image: "" }] }],
    }));
  };

  const updateVariantGroup = (gi, field, value) => {
    setFormFields((prev) => {
      const variants = [...(prev.variants || [])];
      variants[gi] = { ...variants[gi], [field]: value };
      return { ...prev, variants };
    });
  };

  const addVariantOption = (gi) => {
    setFormFields((prev) => {
      const variants = [...(prev.variants || [])];
      variants[gi] = {
        ...variants[gi],
        options: [...(variants[gi].options || []), { label: "", sku: "", price: "", stock: "", image: "" }],
      };
      return { ...prev, variants };
    });
  };

  const updateVariantOption = (gi, oi, field, value) => {
    setFormFields((prev) => {
      const variants = [...(prev.variants || [])];
      const options = [...(variants[gi].options || [])];
      options[oi] = { ...options[oi], [field]: value };
      variants[gi] = { ...variants[gi], options };
      return { ...prev, variants };
    });
  };

  const removeVariantGroup = (gi) => {
    setFormFields((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== gi),
    }));
  };

  const addCustomization = () => {
    setFormFields((prev) => ({
      ...prev,
      customizationOptions: [
        ...(prev.customizationOptions || []),
        { name: "", type: "text", options: [], required: false },
      ],
    }));
  };

  const updateCustomization = (index, field, value) => {
    setFormFields((prev) => {
      const customizationOptions = [...(prev.customizationOptions || [])];
      customizationOptions[index] = { ...customizationOptions[index], [field]: value };
      if (field === "type" && value !== "dropdown") {
        customizationOptions[index].options = [];
      }
      return { ...prev, customizationOptions };
    });
  };

  const removeCustomization = (index) => {
    setFormFields((prev) => ({
      ...prev,
      customizationOptions: (prev.customizationOptions || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim() || !formFields.price || !formFields.catId || previews.length === 0) {
      setAlertBox?.({ open: true, error: true, msg: "Name, price, category, and images are required." });
      setTab(previews.length === 0 ? "images" : !formFields.catId ? "category" : "basic");
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <nav className="admin-dash__product-tabs" aria-label="Product form sections">
        {PRODUCT_FORM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-dash__product-tab${tab === t.id ? " admin-dash__product-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="admin-dash__panel admin-dash__product-panel">
        {tab === "basic" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Product Name" htmlFor="name">
              <input className="admin-dash__input" id="name" name="name" value={formFields.name} onChange={onNameChange} />
            </Field>
            <Field label="Product Code / SKU" htmlFor="sku">
              <input className="admin-dash__input" id="sku" name="sku" value={formFields.sku} onChange={changeInput} />
            </Field>
            <Field label="Product Slug" htmlFor="slug">
              <input className="admin-dash__input" id="slug" name="slug" value={formFields.slug} onChange={changeInput} />
            </Field>
            <Field label="Brand" htmlFor="brand">
              <input className="admin-dash__input" id="brand" name="brand" value={formFields.brand} onChange={changeInput} />
            </Field>
            <Field label="Short Description" htmlFor="shortDescription">
              <input className="admin-dash__input" id="shortDescription" name="shortDescription" value={formFields.shortDescription} onChange={changeInput} />
            </Field>
            <Field label="Status" htmlFor="status">
              <select className="admin-dash__select" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <div className="admin-dash__field" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-dash__label" htmlFor="description">Full Description</label>
              <textarea className="admin-dash__textarea" id="description" name="description" value={formFields.description} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label">
                <input type="checkbox" name="isFeatured" checked={formFields.isFeatured} onChange={changeInput} style={{ marginRight: "0.5rem" }} />
                Featured product
              </label>
            </div>
          </div>
        )}

        {tab === "images" && (
          <div>
            <p className="admin-dash__panel-desc">Upload multiple images. Reorder to set the main product image (first image).</p>
            <Field label="Product Images">
              <ImageUploadField
                uploadEndpoint="/api/products/upload"
                deleteImageEndpoint="/api/products/deleteImage"
                previews={previews}
                setPreviews={setPreviews}
                setAlertBox={setAlertBox}
                clearStagingOnMount={!isEdit}
                reorderable
              />
            </Field>
          </div>
        )}

        {tab === "category" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Main Category" htmlFor="catId">
              <select className="admin-dash__select" id="catId" name="catId" value={formFields.catId} onChange={onCategoryChange}>
                <option value="">Select category</option>
                {catData?.categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub Category" htmlFor="subCatId">
              <select className="admin-dash__select" id="subCatId" name="subCatId" value={formFields.subCatId} onChange={onSubCategoryChange}>
                <option value="">Select sub category</option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {tab === "pricing" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Regular Price (Rs)" htmlFor="price">
              <input className="admin-dash__input" id="price" name="price" type="number" value={formFields.price} onChange={changeInput} />
            </Field>
            <Field label="Compare Price (Rs)" htmlFor="oldPrice">
              <input className="admin-dash__input" id="oldPrice" name="oldPrice" type="number" value={formFields.oldPrice} onChange={changeInput} />
            </Field>
            <Field label="Discount Price (Rs)" htmlFor="discountPrice">
              <input className="admin-dash__input" id="discountPrice" name="discountPrice" type="number" value={formFields.discountPrice} onChange={changeInput} />
            </Field>
            <Field label="Discount Type" htmlFor="discountType">
              <select className="admin-dash__select" id="discountType" name="discountType" value={formFields.discountType} onChange={changeInput}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Field>
            <Field label="Discount (%)" htmlFor="discount">
              <input className="admin-dash__input" id="discount" name="discount" type="number" value={formFields.discount} onChange={changeInput} />
            </Field>
          </div>
        )}

        {tab === "inventory" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Stock Quantity" htmlFor="countInStock">
              <input className="admin-dash__input" id="countInStock" name="countInStock" type="number" value={formFields.countInStock} onChange={changeInput} />
            </Field>
            <Field label="Stock Status" htmlFor="stockStatus">
              <select className="admin-dash__select" id="stockStatus" name="stockStatus" value={formFields.stockStatus} onChange={changeInput}>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="pre_order">Pre Order</option>
              </select>
            </Field>
            <Field label="Minimum Stock Alert" htmlFor="minStockAlert">
              <input className="admin-dash__input" id="minStockAlert" name="minStockAlert" type="number" value={formFields.minStockAlert} onChange={changeInput} placeholder="Notify when stock &lt;= 5" />
            </Field>
            <Field label="Legacy size option" htmlFor="size">
              <select className="admin-dash__select" id="size" name="size" value={formFields.size} onChange={changeInput}>
                <option value="">Select size</option>
                {sizes.map((s) => (
                  <option key={s._id} value={s.size}>{s.size}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {tab === "variants" && (
          <div className="admin-dash__variant-editor">
            <p className="admin-dash__panel-desc">Add variant groups such as Size or Color with individual SKU, price, and stock.</p>
            {(formFields.variants || []).map((group, gi) => (
              <div key={gi} className="admin-dash__variant-group">
                <div className="admin-dash__variant-group-head">
                  <input
                    className="admin-dash__input"
                    placeholder="Variant name (e.g. Size)"
                    value={group.variantName}
                    onChange={(e) => updateVariantGroup(gi, "variantName", e.target.value)}
                  />
                  <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => removeVariantGroup(gi)}>
                    <FaTrash />
                  </button>
                </div>
                {(group.options || []).map((opt, oi) => (
                  <div key={oi} className="admin-dash__variant-option-row">
                    <input className="admin-dash__input" placeholder="Label" value={opt.label} onChange={(e) => updateVariantOption(gi, oi, "label", e.target.value)} />
                    <input className="admin-dash__input" placeholder="SKU" value={opt.sku} onChange={(e) => updateVariantOption(gi, oi, "sku", e.target.value)} />
                    <input className="admin-dash__input" type="number" placeholder="Price" value={opt.price} onChange={(e) => updateVariantOption(gi, oi, "price", e.target.value)} />
                    <input className="admin-dash__input" type="number" placeholder="Stock" value={opt.stock} onChange={(e) => updateVariantOption(gi, oi, "stock", e.target.value)} />
                    <input className="admin-dash__input" placeholder="Image URL" value={opt.image} onChange={(e) => updateVariantOption(gi, oi, "image", e.target.value)} />
                  </div>
                ))}
                <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" onClick={() => addVariantOption(gi)}>
                  <FaPlus /> Add option
                </button>
              </div>
            ))}
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={addVariantGroup}>
              <FaPlus /> Add variant group
            </button>
          </div>
        )}

        {tab === "customization" && (
          <div className="admin-dash__variant-editor">
            <p className="admin-dash__panel-desc">Handmade customization options for engraving, gift messages, custom colors, etc.</p>
            {(formFields.customizationOptions || []).map((opt, index) => (
              <div key={index} className="admin-dash__custom-option">
                <input className="admin-dash__input" placeholder="Option name" value={opt.name} onChange={(e) => updateCustomization(index, "name", e.target.value)} />
                <select className="admin-dash__select" value={opt.type} onChange={(e) => updateCustomization(index, "type", e.target.value)}>
                  <option value="text">Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="file">File Upload</option>
                </select>
                {opt.type === "dropdown" && (
                  <input
                    className="admin-dash__input"
                    placeholder="Dropdown values (comma separated)"
                    value={(opt.options || []).join(", ")}
                    onChange={(e) => updateCustomization(index, "options", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  />
                )}
                <label className="admin-dash__label">
                  <input type="checkbox" checked={opt.required} onChange={(e) => updateCustomization(index, "required", e.target.checked)} style={{ marginRight: "0.35rem" }} />
                  Required
                </label>
                <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => removeCustomization(index)}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={addCustomization}>
              <FaPlus /> Add customization option
            </button>
          </div>
        )}

        {tab === "shipping" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Weight (kg)" htmlFor="shipping-weight">
              <input className="admin-dash__input" id="shipping-weight" type="number" value={formFields.shipping?.weight} onChange={(e) => changeNested("shipping", "weight", e.target.value)} />
            </Field>
            <Field label="Length (cm)" htmlFor="shipping-length">
              <input className="admin-dash__input" id="shipping-length" type="number" value={formFields.shipping?.length} onChange={(e) => changeNested("shipping", "length", e.target.value)} />
            </Field>
            <Field label="Width (cm)" htmlFor="shipping-width">
              <input className="admin-dash__input" id="shipping-width" type="number" value={formFields.shipping?.width} onChange={(e) => changeNested("shipping", "width", e.target.value)} />
            </Field>
            <Field label="Height (cm)" htmlFor="shipping-height">
              <input className="admin-dash__input" id="shipping-height" type="number" value={formFields.shipping?.height} onChange={(e) => changeNested("shipping", "height", e.target.value)} />
            </Field>
            <Field label="Shipping Charge (Rs)" htmlFor="shipping-charge">
              <input className="admin-dash__input" id="shipping-charge" type="number" value={formFields.shipping?.shippingCharge} onChange={(e) => changeNested("shipping", "shippingCharge", e.target.value)} disabled={formFields.shipping?.freeShipping} />
            </Field>
            <div className="admin-dash__field">
              <label className="admin-dash__label">
                <input type="checkbox" checked={formFields.shipping?.freeShipping} onChange={(e) => changeNested("shipping", "freeShipping", e.target.checked)} style={{ marginRight: "0.5rem" }} />
                Free shipping
              </label>
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Meta Title" htmlFor="seo-metaTitle">
              <input className="admin-dash__input" id="seo-metaTitle" value={formFields.seo?.metaTitle} onChange={(e) => changeNested("seo", "metaTitle", e.target.value)} />
            </Field>
            <Field label="URL Slug" htmlFor="slug-seo">
              <input className="admin-dash__input" id="slug-seo" name="slug" value={formFields.slug} onChange={changeInput} />
            </Field>
            <div className="admin-dash__field" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-dash__label" htmlFor="seo-metaDescription">Meta Description</label>
              <textarea className="admin-dash__textarea" id="seo-metaDescription" value={formFields.seo?.metaDescription} onChange={(e) => changeNested("seo", "metaDescription", e.target.value)} />
            </div>
            <div className="admin-dash__field" style={{ gridColumn: "1 / -1" }}>
              <label className="admin-dash__label" htmlFor="seo-keywords">Keywords</label>
              <input className="admin-dash__input" id="seo-keywords" value={formFields.seo?.keywords} onChange={(e) => changeNested("seo", "keywords", e.target.value)} placeholder="handmade, candle, gift" />
            </div>
          </div>
        )}

        <div className="admin-dash__product-form-actions">
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : submitLabel}
          </button>
        </div>
      </section>
    </form>
  );
}

export { defaultProductFields };
