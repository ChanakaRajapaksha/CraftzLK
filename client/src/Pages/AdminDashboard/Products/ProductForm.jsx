import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import ProductImageUploadField from "../../../Components/AdminDashboard/ProductImageUploadField";
import VariantImageUploadField from "../../../Components/AdminDashboard/VariantImageUploadField";
import { productEndpoints } from "../../../api/endpoint.js";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import ProductController from "../../../controllers/product.controller.js";
import { defaultProductFields, PRODUCT_FORM_ERROR_TAB_MAP, PRODUCT_FORM_TABS, slugify, TRUST_BADGE_FORM_FIELDS, validateProductForm } from "./productFormDefaults";

function Field({ label, htmlFor, children, full = false, size = "default", required = false, error = "" }) {
  const sizeClass = size === "full" || full
    ? " admin-dash__field--full"
    : size === "wide"
      ? " admin-dash__field--wide"
      : size === "short"
        ? " admin-dash__field--short"
        : "";

  return (
    <div className={`admin-dash__field${sizeClass}${error ? " admin-dash__field--error" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="admin-dash__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? <p className="admin-dash__field-error">{error}</p> : null}
    </div>
  );
}

function fieldClass(baseClass, hasError) {
  return `${baseClass}${hasError ? ` ${baseClass}--error` : ""}`;
}

export default function ProductForm({
  formFields,
  setFormFields,
  previews,
  setPreviews,
  catData,
  setAlertBox,
  isEdit = false,
  productId = null,
  submitLabel = "Save product",
  isLoading = false,
  variant = "page",
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");
  const [fieldErrors, setFieldErrors] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [removingVariantOptionId, setRemovingVariantOptionId] = useState(null);

  // Clear leftover staged uploads once per form session (not on every Images
  // tab visit) so images uploaded in this session — including variant images,
  // which share the same staging collection — are not destroyed on Cloudinary
  // when the Images tab remounts.
  useEffect(() => {
    if (isEdit) return;
    ImageUploadController.getStagingImages().then((res) => {
      if (res?.length) {
        res.forEach((item) => {
          item?.images?.forEach((img) => {
            ProductController.deleteImage(img).then(() => {
              ImageUploadController.clearStagingImages();
            });
          });
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formFields.catId && catData?.categoryList) {
      const cat = catData.categoryList.find((c) => c._id === formFields.catId);
      setSubCategories(cat?.children || []);
    }
  }, [formFields.catId, catData]);

  useEffect(() => {
    if (previews.length > 0) {
      setFieldErrors((prev) => {
        if (!prev.images) return prev;
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  }, [previews]);

  const tabsWithErrors = useMemo(() => {
    const tabs = new Set();
    Object.keys(fieldErrors).forEach((key) => {
      if (PRODUCT_FORM_ERROR_TAB_MAP[key]) tabs.add(PRODUCT_FORM_ERROR_TAB_MAP[key]);
    });
    return tabs;
  }, [fieldErrors]);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const changeInput = (e) => {
    const { name, value, type, checked } = e.target;
    clearFieldError(name);
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
    clearFieldError("name");
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
    clearFieldError("catId");
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
      variants: [
        ...(prev.variants || []),
        {
          variantName: "",
          options: [
            {
              label: "",
              sku: "",
              price: "",
              stock: "",
              stockStatus: "in_stock",
              image: "",
              isDefault: true,
            },
          ],
        },
      ],
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
      const existingOptions = variants[gi].options || [];
      variants[gi] = {
        ...variants[gi],
        options: [
          ...existingOptions,
          {
            label: "",
            sku: "",
            price: "",
            stock: "",
            stockStatus: "in_stock",
            image: "",
            isDefault: existingOptions.length === 0,
          },
        ],
      };
      return { ...prev, variants };
    });
  };

  const setDefaultVariantOption = (gi, oi) => {
    setFormFields((prev) => {
      const variants = [...(prev.variants || [])];
      const options = (variants[gi].options || []).map((opt, index) => ({
        ...opt,
        isDefault: index === oi,
      }));
      variants[gi] = { ...variants[gi], options };
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

  const removeVariantOptionLocal = (gi, oi) => {
    setFormFields((prev) => {
      const variants = [...(prev.variants || [])];
      const options = [...(variants[gi]?.options || [])].filter((_, index) => index !== oi);

      if (!options.length) {
        return {
          ...prev,
          variants: variants.filter((_, index) => index !== gi),
        };
      }

      if (!options.some((opt) => opt.isDefault)) {
        options[0] = { ...options[0], isDefault: true };
      }

      variants[gi] = { ...variants[gi], options };
      return { ...prev, variants };
    });
  };

  const removeVariantOption = async (gi, oi) => {
    const option = formFields.variants?.[gi]?.options?.[oi];
    const optionId = option?._id;
    const isPersisted = Boolean(isEdit && productId && optionId);

    if (!isPersisted) {
      if (option?.image) {
        ProductController.deleteImage(option.image).catch(() => {});
      }
      removeVariantOptionLocal(gi, oi);
      return;
    }

    setRemovingVariantOptionId(String(optionId));
    try {
      const res = await ProductController.removeVariantOption(productId, optionId);
      if (res?.success === false) {
        setAlertBox?.({
          open: true,
          error: true,
          msg: res?.message || "Failed to remove variant option.",
        });
        return;
      }

      removeVariantOptionLocal(gi, oi);
      setAlertBox?.({
        open: true,
        error: false,
        msg: res?.message || "Variant option removed.",
      });
    } catch (error) {
      setAlertBox?.({
        open: true,
        error: true,
        msg: error?.response?.data?.message || "Failed to remove variant option.",
      });
    } finally {
      setRemovingVariantOptionId(null);
    }
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

  const addShortDescriptionPoint = () => {
    setFormFields((prev) => ({
      ...prev,
      shortDescription: {
        ...prev.shortDescription,
        bullets: [...(prev.shortDescription?.bullets || []), ""],
      },
    }));
  };

  const updateShortDescriptionPoint = (index, value) => {
    clearFieldError("shortDescription");
    setFormFields((prev) => {
      const bullets = [...(prev.shortDescription?.bullets || [])];
      bullets[index] = value;
      return {
        ...prev,
        shortDescription: { ...prev.shortDescription, bullets },
      };
    });
  };

  const removeShortDescriptionPoint = (index) => {
    setFormFields((prev) => {
      const bullets = (prev.shortDescription?.bullets || []).filter((_, i) => i !== index);
      return {
        ...prev,
        shortDescription: {
          ...prev.shortDescription,
          bullets: bullets.length ? bullets : [""],
        },
      };
    });
  };

  const addDescriptionPoint = () => {
    setFormFields((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        points: [...(prev.description?.points || []), { title: "", text: "" }],
      },
    }));
  };

  const updateDescriptionPoint = (index, field, value) => {
    clearFieldError("description");
    setFormFields((prev) => {
      const points = [...(prev.description?.points || [])];
      points[index] = { ...points[index], [field]: value };
      return {
        ...prev,
        description: { ...prev.description, points },
      };
    });
  };

  const removeDescriptionPoint = (index) => {
    setFormFields((prev) => {
      const points = (prev.description?.points || []).filter((_, i) => i !== index);
      return {
        ...prev,
        description: {
          ...prev.description,
          points: points.length ? points : [{ title: "", text: "" }],
        },
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateProductForm(formFields, previews);

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setTab(validation.tab);
      setAlertBox?.({ open: true, error: true, msg: validation.message });
      return;
    }

    setFieldErrors({});
    onSubmit(e);
  };

  return (
    <form
      id={variant === "modal" ? "product-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <nav className="admin-dash__product-tabs" aria-label="Product form sections">
        {PRODUCT_FORM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-dash__product-tab${tab === t.id ? " admin-dash__product-tab--active" : ""}${tabsWithErrors.has(t.id) ? " admin-dash__product-tab--error" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="admin-dash__panel admin-dash__product-panel">
        {tab === "basic" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Product Name" htmlFor="name" size="wide" required error={fieldErrors.name}>
              <input
                className={fieldClass("admin-dash__input", fieldErrors.name)}
                id="name"
                name="name"
                value={formFields.name}
                onChange={onNameChange}
                placeholder="e.g. R&R Pure Ceylon Black Tea"
                required
                aria-required="true"
              />
              <p className="admin-dash__field-hint">
                Use the parent product name only — do not include variant details such as weight or size.
              </p>
            </Field>
            <Field label="Parent Product Code" htmlFor="sku" size="short">
              <input
                className="admin-dash__input"
                id="sku"
                name="sku"
                value={formFields.sku}
                onChange={changeInput}
                placeholder="e.g. RR-CBT"
              />
              <p className="admin-dash__field-hint">
                Identifies the product family. Each variant option needs its own SKU below.
              </p>
            </Field>
            <Field label="Product Slug" htmlFor="slug" size="wide">
              <input className="admin-dash__input" id="slug" name="slug" value={formFields.slug} onChange={changeInput} />
            </Field>
            <Field label="Brand" htmlFor="brand" size="short">
              <input className="admin-dash__input" id="brand" name="brand" value={formFields.brand} onChange={changeInput} />
            </Field>
            <Field label="Short Description" htmlFor="shortDescription-0" full required error={fieldErrors.shortDescription}>
              <div className="admin-dash__short-desc-points">
                <p className="admin-dash__panel-desc">
                  Add one highlight per line — shown as bullet points on the product page.
                </p>
                {(formFields.shortDescription?.bullets || [""]).map((point, index) => (
                  <div key={index} className="admin-dash__short-desc-point">
                    <input
                      className={fieldClass("admin-dash__input", fieldErrors.shortDescription)}
                      id={`shortDescription-${index}`}
                      value={point}
                      onChange={(e) => updateShortDescriptionPoint(index, e.target.value)}
                      placeholder={`Point ${index + 1}`}
                      aria-required={index === 0 ? "true" : undefined}
                    />
                    <button
                      type="button"
                      className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon admin-dash__short-desc-point-delete"
                      onClick={() => removeShortDescriptionPoint(index)}
                      aria-label={`Remove point ${index + 1}`}
                      disabled={(formFields.shortDescription?.bullets || []).length <= 1 && !point.trim()}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                  onClick={addShortDescriptionPoint}
                >
                  <FaPlus /> Add point
                </button>
              </div>
            </Field>
            <Field label="Status" htmlFor="status" size="short">
              <select className="admin-dash__select" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Full Description" htmlFor="description-title-0" full required error={fieldErrors.description}>
              <div className="admin-dash__full-desc-points">
                <p className="admin-dash__panel-desc">
                  Add feature points with a bold title and supporting text, shown on the product page.
                </p>
                {(formFields.description?.points || [{ title: "", text: "" }]).map((point, index) => (
                  <div key={index} className="admin-dash__full-desc-point">
                    <div className="admin-dash__full-desc-point-head">
                      <input
                        className={fieldClass("admin-dash__input", fieldErrors.description)}
                        id={`description-title-${index}`}
                        value={point.title}
                        onChange={(e) => updateDescriptionPoint(index, "title", e.target.value)}
                        placeholder="e.g. Handcrafted Artisan Quality"
                        aria-required={index === 0 ? "true" : undefined}
                      />
                      <button
                        type="button"
                        className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon admin-dash__full-desc-point-delete"
                        onClick={() => removeDescriptionPoint(index)}
                        aria-label={`Remove description point ${index + 1}`}
                        disabled={
                          (formFields.description?.points || []).length <= 1 &&
                          !point.title.trim() &&
                          !point.text.trim()
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <textarea
                      className={fieldClass("admin-dash__textarea", fieldErrors.description)}
                      id={`description-text-${index}`}
                      value={point.text}
                      onChange={(e) => updateDescriptionPoint(index, "text", e.target.value)}
                      placeholder="Describe this feature in one or two sentences."
                      rows={3}
                      aria-required={index === 0 ? "true" : undefined}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                  onClick={addDescriptionPoint}
                >
                  <FaPlus /> Add description point
                </button>
              </div>
            </Field>
            <div className="admin-dash__field admin-dash__field--checkbox">
              <label className="admin-dash__label admin-dash__label--inline">
                <input type="checkbox" name="isFeatured" checked={formFields.isFeatured} onChange={changeInput} />
                Featured product
              </label>
            </div>
            <div className="admin-dash__field admin-dash__field--full">
              <p className="admin-dash__category-tree-hint">
                Product detail highlights — these three points appear below the product image on the storefront product details page.
              </p>
            </div>
            {TRUST_BADGE_FORM_FIELDS.map((badgeField) => (
              <Field
                key={badgeField.id}
                label={badgeField.label}
                htmlFor={`trust-badge-${badgeField.id}`}
                full
              >
                <input
                  className="admin-dash__input"
                  id={`trust-badge-${badgeField.id}`}
                  value={formFields.trustBadges?.[badgeField.id] ?? ""}
                  onChange={(e) => changeNested("trustBadges", badgeField.id, e.target.value)}
                  placeholder={badgeField.placeholder}
                />
              </Field>
            ))}
          </div>
        )}

        {tab === "images" && (
          <div className="admin-dash__product-images-tab">
            <Field label="Product Images" full required error={fieldErrors.images}>
              <ProductImageUploadField
                uploadEndpoint={productEndpoints.upload}
                deleteImageEndpoint={productEndpoints.deleteImage}
                previews={previews}
                setPreviews={setPreviews}
                setAlertBox={setAlertBox}
                clearStagingOnMount={false}
              />
            </Field>
          </div>
        )}

        {tab === "category" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Main Category" htmlFor="catId" size="wide" required error={fieldErrors.catId}>
              <select
                className={fieldClass("admin-dash__select", fieldErrors.catId)}
                id="catId"
                name="catId"
                value={formFields.catId}
                onChange={onCategoryChange}
                required
                aria-required="true"
              >
                <option value="">Select category</option>
                {catData?.categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub Category" htmlFor="subCatId" size="wide">
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
            <Field label="Regular Price (Rs)" htmlFor="price" size="short" required error={fieldErrors.price}>
              <input
                className={fieldClass("admin-dash__input", fieldErrors.price)}
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formFields.price}
                onChange={changeInput}
                required
                aria-required="true"
              />
            </Field>
            <Field label="Product Cost (Rs)" htmlFor="productCost" size="short">
              <input
                className="admin-dash__input"
                id="productCost"
                name="productCost"
                type="number"
                min="0"
                step="0.01"
                value={formFields.productCost}
                onChange={changeInput}
                placeholder="0.00"
              />
            </Field>
            <Field label="Compare Price (Rs)" htmlFor="oldPrice" size="short">
              <input className="admin-dash__input" id="oldPrice" name="oldPrice" type="number" value={formFields.oldPrice} onChange={changeInput} />
            </Field>
            <Field label="Discount Price (Rs)" htmlFor="discountPrice" size="short">
              <input className="admin-dash__input" id="discountPrice" name="discountPrice" type="number" value={formFields.discountPrice} onChange={changeInput} />
            </Field>
            <Field label="Discount Type" htmlFor="discountType" size="short">
              <select className="admin-dash__select" id="discountType" name="discountType" value={formFields.discountType} onChange={changeInput}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Field>
            <Field label="Discount (%)" htmlFor="discount" size="short">
              <input className="admin-dash__input" id="discount" name="discount" type="number" value={formFields.discount} onChange={changeInput} />
            </Field>
          </div>
        )}

        {tab === "inventory" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Stock Quantity" htmlFor="countInStock" size="short" required error={fieldErrors.countInStock}>
              <input
                className={fieldClass("admin-dash__input", fieldErrors.countInStock)}
                id="countInStock"
                name="countInStock"
                type="number"
                min="0"
                step="1"
                value={formFields.countInStock}
                onChange={changeInput}
                required
                aria-required="true"
              />
            </Field>
            <Field label="Stock Status" htmlFor="stockStatus" size="short">
              <select className="admin-dash__select" id="stockStatus" name="stockStatus" value={formFields.stockStatus} onChange={changeInput}>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="pre_order">Pre Order</option>
              </select>
            </Field>
            <Field label="Minimum Stock Alert" htmlFor="minStockAlert" size="short">
              <input className="admin-dash__input" id="minStockAlert" name="minStockAlert" type="number" value={formFields.minStockAlert} onChange={changeInput} placeholder="Notify when stock &lt;= 5" />
            </Field>
          </div>
        )}

        {tab === "variants" && (
          <div className="admin-dash__variant-editor">
            <p className="admin-dash__panel-desc">
              Add variant groups such as Weight or Color. Keep the parent product name and code in Basic Info;
              each purchasable option gets its own SKU, price, stock, and image.
            </p>
            {(formFields.variants || []).map((group, gi) => (
              <div key={gi} className="admin-dash__variant-group">
                <div className="admin-dash__variant-group-head">
                  <Field label="Variant group" htmlFor={`variant-name-${gi}`} size="wide">
                    <input
                      className="admin-dash__input"
                      id={`variant-name-${gi}`}
                      placeholder="e.g. Size, Color"
                      value={group.variantName}
                      onChange={(e) => updateVariantGroup(gi, "variantName", e.target.value)}
                    />
                  </Field>
                  <button
                    type="button"
                    className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon admin-dash__variant-group-delete"
                    onClick={() => removeVariantGroup(gi)}
                    aria-label="Remove variant group"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="admin-dash__variant-option-table">
                  <div className="admin-dash__variant-option-head" aria-hidden="true">
                    <span>Label</span>
                    <span>SKU</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span>Stock Status</span>
                    <span>Default variant</span>
                    <span>Image</span>
                    <span>Remove</span>
                  </div>
                  {(group.options || []).map((opt, oi) => {
                    const optionKey = opt._id || `new-${gi}-${oi}`;
                    const isRemoving = removingVariantOptionId === String(opt._id);

                    return (
                    <div key={optionKey} className="admin-dash__variant-option-row">
                      <input className="admin-dash__input" placeholder="Label" value={opt.label} onChange={(e) => updateVariantOption(gi, oi, "label", e.target.value)} />
                      <input className="admin-dash__input" placeholder="SKU" value={opt.sku} onChange={(e) => updateVariantOption(gi, oi, "sku", e.target.value)} />
                      <input className="admin-dash__input" type="number" placeholder="Price" value={opt.price} onChange={(e) => updateVariantOption(gi, oi, "price", e.target.value)} />
                      <input className="admin-dash__input" type="number" placeholder="Stock" value={opt.stock} onChange={(e) => updateVariantOption(gi, oi, "stock", e.target.value)} />
                      <select
                        className="admin-dash__select"
                        value={opt.stockStatus || "in_stock"}
                        onChange={(e) => updateVariantOption(gi, oi, "stockStatus", e.target.value)}
                        aria-label={`Stock status for ${group.variantName || "variant"} option ${oi + 1}`}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="pre_order">Pre Order</option>
                      </select>
                      <label className="admin-dash__variant-default">
                        <input
                          type="radio"
                          name={`default-variant-${gi}`}
                          checked={Boolean(opt.isDefault)}
                          onChange={() => setDefaultVariantOption(gi, oi)}
                          aria-label={`Set ${opt.label || `option ${oi + 1}`} as default variant`}
                        />
                        <span>Default</span>
                      </label>
                      <VariantImageUploadField
                        value={opt.image}
                        onChange={(url) => updateVariantOption(gi, oi, "image", url)}
                        setAlertBox={setAlertBox}
                        label={`image for ${group.variantName || "variant"} option ${oi + 1}`}
                      />
                      <button
                        type="button"
                        className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon admin-dash__variant-option-delete"
                        onClick={() => removeVariantOption(gi, oi)}
                        aria-label={`Remove ${group.variantName || "variant"} option ${oi + 1}`}
                        disabled={isRemoving || isLoading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    );
                  })}
                </div>
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
                <div className="admin-dash__field admin-dash__field--wide">
                  <label className="admin-dash__label" htmlFor={`custom-name-${index}`}>Option name</label>
                  <input className="admin-dash__input" id={`custom-name-${index}`} placeholder="e.g. Gift message" value={opt.name} onChange={(e) => updateCustomization(index, "name", e.target.value)} />
                </div>
                <div className="admin-dash__field admin-dash__field--short">
                  <label className="admin-dash__label" htmlFor={`custom-type-${index}`}>Type</label>
                  <select className="admin-dash__select" id={`custom-type-${index}`} value={opt.type} onChange={(e) => updateCustomization(index, "type", e.target.value)}>
                    <option value="text">Text</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon admin-dash__custom-option-delete"
                  onClick={() => removeCustomization(index)}
                  aria-label="Remove customization option"
                >
                  <FaTrash />
                </button>
                {opt.type === "dropdown" && (
                  <div className="admin-dash__field admin-dash__field--full">
                    <label className="admin-dash__label" htmlFor={`custom-options-${index}`}>Dropdown values</label>
                    <input
                      className="admin-dash__input"
                      id={`custom-options-${index}`}
                      placeholder="Comma separated values"
                      value={(opt.options || []).join(", ")}
                      onChange={(e) => updateCustomization(index, "options", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                )}
                <div className="admin-dash__field admin-dash__field--checkbox">
                  <label className="admin-dash__label admin-dash__label--inline">
                    <input type="checkbox" checked={opt.required} onChange={(e) => updateCustomization(index, "required", e.target.checked)} />
                    Required
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={addCustomization}>
              <FaPlus /> Add customization option
            </button>
          </div>
        )}

        {tab === "seo" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Meta Title" htmlFor="seo-metaTitle" size="wide">
              <input className="admin-dash__input" id="seo-metaTitle" value={formFields.seo?.metaTitle} onChange={(e) => changeNested("seo", "metaTitle", e.target.value)} />
            </Field>
            <Field label="URL Slug" htmlFor="slug-seo" size="wide">
              <input className="admin-dash__input" id="slug-seo" name="slug" value={formFields.slug} onChange={changeInput} />
            </Field>
            <Field label="Meta Description" htmlFor="seo-metaDescription" full>
              <textarea className="admin-dash__textarea" id="seo-metaDescription" value={formFields.seo?.metaDescription} onChange={(e) => changeNested("seo", "metaDescription", e.target.value)} />
            </Field>
            <Field label="Keywords" htmlFor="seo-keywords" full>
              <input className="admin-dash__input" id="seo-keywords" value={formFields.seo?.keywords} onChange={(e) => changeNested("seo", "keywords", e.target.value)} placeholder="handmade, candle, gift" />
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

export { defaultProductFields };
