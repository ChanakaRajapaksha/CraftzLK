import { useEffect, useMemo, useState } from "react";
import {
  DISCOUNT_FORM_TABS,
  DISCOUNT_TYPES,
  buildVariantSelectionKey,
  formToPayload,
  productHasSelectableVariants,
} from "./discountFormDefaults";
import ProductController from "../../../controllers/product.controller.js";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function DiscountForm({
  formFields,
  setFormFields,
  catData,
  setAlertBox,
  isLoading = false,
  submitLabel = "Save discount",
  variant = "page",
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    setProductsLoading(true);
    ProductController.getActive()
      .then((res) => {
        if (res?.success === false) {
          setProducts([]);
          return;
        }
        const list = res?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const baseMatch = [product.name, product.catName].some((value) =>
        String(value || "").toLowerCase().includes(q)
      );
      if (baseMatch) return true;

      return (product.variants || []).some((group) => {
        if (String(group.variantName || "").toLowerCase().includes(q)) return true;
        return (group.options || []).some((option) =>
          String(option.label || "").toLowerCase().includes(q)
        );
      });
    });
  }, [products, productSearch]);

  const selectedVariantKeys = useMemo(
    () =>
      new Set(
        (formFields.variantTargets || []).map(
          (target) =>
            target.selectionKey ||
            buildVariantSelectionKey(target.productId, target.variantName, target.optionLabel)
        )
      ),
    [formFields.variantTargets]
  );

  const selectedCount = useMemo(() => {
    const variantProductIds = new Set(
      (formFields.variantTargets || []).map((target) => String(target.productId || ""))
    );
    const wholeProducts = (formFields.productIds || []).filter(
      (id) => !variantProductIds.has(String(id))
    );
    return wholeProducts.length + (formFields.variantTargets || []).length;
  }, [formFields.productIds, formFields.variantTargets]);

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const onCategoryChange = (e) => {
    const categoryId = e.target.value;
    const cat = (catData?.categoryList || []).find((c) => (c._id || c.id) === categoryId);
    setFormFields((prev) => ({
      ...prev,
      categoryId,
      categoryName: cat?.name || "",
    }));
  };

  const toggleProduct = (product) => {
    const pid = String(product._id || product.id);
    const pname = product.name;
    setFormFields((prev) => {
      const ids = [...(prev.productIds || [])];
      const names = [...(prev.productNames || [])];
      const idx = ids.indexOf(pid);
      if (idx >= 0) {
        ids.splice(idx, 1);
        names.splice(idx, 1);
      } else {
        ids.push(pid);
        names.push(pname);
      }
      return { ...prev, productIds: ids, productNames: names };
    });
  };

  const toggleVariantOption = (product, group, option) => {
    const productId = String(product._id || product.id);
    const variantName = group.variantName || "";
    const optionLabel = option.label || "";
    const selectionKey = buildVariantSelectionKey(productId, variantName, optionLabel);

    setFormFields((prev) => {
      const targets = [...(prev.variantTargets || [])];
      const existingIndex = targets.findIndex(
        (target) =>
          (target.selectionKey ||
            buildVariantSelectionKey(target.productId, target.variantName, target.optionLabel)) ===
          selectionKey
      );

      if (existingIndex >= 0) {
        targets.splice(existingIndex, 1);
      } else {
        targets.push({
          productId,
          productName: product.name || "",
          variantName,
          optionLabel,
          optionId: option._id || option.id ? String(option._id || option.id) : "",
          selectionKey,
        });
      }

      const productIds = new Set((prev.productIds || []).map(String));
      const productNames = [...(prev.productNames || [])];
      const productNameMap = new Map(
        (prev.productIds || []).map((id, index) => [String(id), productNames[index] || ""])
      );

      if (targets.some((target) => String(target.productId) === productId)) {
        productIds.add(productId);
        productNameMap.set(productId, product.name || "");
      } else {
        // Keep whole-product selections; only drop productId if it was variant-driven only
        // Products with variants are never whole-product selected in this UI.
        if (productHasSelectableVariants(product)) {
          productIds.delete(productId);
          productNameMap.delete(productId);
        }
      }

      const nextIds = [...productIds];
      const nextNames = nextIds.map((id) => productNameMap.get(id) || "");

      return {
        ...prev,
        variantTargets: targets,
        productIds: nextIds,
        productNames: nextNames,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Discount name is required." });
      setTab("basic");
      return;
    }
    if (
      formFields.type === "product" &&
      !(formFields.productIds || []).length &&
      !(formFields.variantTargets || []).length
    ) {
      setAlertBox?.({ open: true, error: true, msg: "Select at least one product or variant." });
      setTab("target");
      return;
    }
    if (formFields.type === "category" && !formFields.categoryId) {
      setAlertBox?.({ open: true, error: true, msg: "Select a category." });
      setTab("target");
      return;
    }
    onSubmit(e, formToPayload(formFields));
  };

  return (
    <form
      id={variant === "modal" ? "discount-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <nav className="admin-dash__product-tabs" aria-label="Discount form sections">
        {DISCOUNT_FORM_TABS.map((item) => (
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
            <Field label="Discount Name" htmlFor="name" full>
              <input className="admin-dash__input" id="name" name="name" value={formFields.name} onChange={changeInput} placeholder="e.g. Handloom Saree Offer" />
            </Field>
            <Field label="Discount Type" htmlFor="type">
              <select className="admin-dash__select" id="type" name="type" value={formFields.type} onChange={changeInput}>
                {DISCOUNT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Value Type" htmlFor="discountType">
              <select className="admin-dash__select" id="discountType" name="discountType" value={formFields.discountType} onChange={changeInput}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </Field>
            <Field label={formFields.discountType === "fixed" ? "Amount (Rs.)" : "Percentage (%)"} htmlFor="discountValue">
              <input className="admin-dash__input" id="discountValue" name="discountValue" type="number" min="0" value={formFields.discountValue} onChange={changeInput} />
            </Field>
            <Field label="Status" htmlFor="status">
              <select className="admin-dash__select admin-dash__select--compact" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            {formFields.type === "seasonal" && (
              <Field label="Seasonal Description" htmlFor="description" full>
                <textarea className="admin-dash__textarea" id="description" name="description" rows={3} value={formFields.description} onChange={changeInput} placeholder="Describe the seasonal promotion…" />
              </Field>
            )}
          </div>
        )}

        {tab === "target" && formFields.type === "product" && (
          <div className="admin-dash__field admin-dash__field--full">
            <label className="admin-dash__label" htmlFor="discount-product-search">
              Select Products & Variants
            </label>
            <input
              id="discount-product-search"
              className="admin-dash__input"
              style={{ marginBottom: "0.75rem" }}
              placeholder="Search products by name, category, or variant…"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <div className="admin-dash__checkbox-list admin-dash__checkbox-list--products">
              {productsLoading ? (
                <p className="admin-dash__hint">Loading active products…</p>
              ) : filteredProducts.length === 0 ? (
                <p className="admin-dash__hint">
                  {products.length === 0
                    ? "No active products found. Add products first."
                    : "No products match your search."}
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const pid = String(product._id || product.id);
                  const hasVariants = productHasSelectableVariants(product);
                  const productChecked = (formFields.productIds || []).includes(pid);

                  if (!hasVariants) {
                    return (
                      <label key={pid} className="admin-dash__checkbox-item admin-dash__checkbox-item--product">
                        <input
                          type="checkbox"
                          checked={productChecked}
                          onChange={() => toggleProduct(product)}
                        />
                        <span className="admin-dash__discount-product-name">{product.name}</span>
                      </label>
                    );
                  }

                  return (
                    <div key={pid} className="admin-dash__discount-product-group">
                      <div className="admin-dash__discount-product-name">{product.name}</div>
                      {(product.variants || []).map((group, groupIndex) => {
                        const options = (group.options || []).filter((option) => option.label);
                        if (!options.length) return null;
                        return (
                          <div
                            key={`${pid}-${group.variantName || groupIndex}`}
                            className="admin-dash__discount-variant-group"
                          >
                            <div className="admin-dash__discount-variant-group-label">
                              {group.variantName || `Variant ${groupIndex + 1}`}
                            </div>
                            <div className="admin-dash__discount-variant-options">
                              {options.map((option, optionIndex) => {
                                const selectionKey = buildVariantSelectionKey(
                                  pid,
                                  group.variantName || "",
                                  option.label || ""
                                );
                                const checked = selectedVariantKeys.has(selectionKey);
                                return (
                                  <label
                                    key={`${selectionKey}-${optionIndex}`}
                                    className="admin-dash__checkbox-item admin-dash__checkbox-item--variant"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleVariantOption(product, group, option)}
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
            {selectedCount > 0 && (
              <p className="admin-dash__hint" style={{ marginTop: "0.65rem" }}>
                {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
                {(formFields.variantTargets || []).length > 0
                  ? ` (${(formFields.variantTargets || []).length} variant${
                      (formFields.variantTargets || []).length === 1 ? "" : "s"
                    })`
                  : ""}
                .
              </p>
            )}
          </div>
        )}

        {tab === "target" && formFields.type === "category" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Category" htmlFor="categoryId">
              <select className="admin-dash__select" id="categoryId" value={formFields.categoryId} onChange={onCategoryChange}>
                <option value="">Select category</option>
                {(catData?.categoryList || []).map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {tab === "target" && formFields.type === "seasonal" && (
          <p className="admin-dash__hint">Seasonal sales apply store-wide to all active products during the scheduled period. Add a description on the Details tab.</p>
        )}

        {tab === "schedule" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Start Date" htmlFor="startDate">
              <input className="admin-dash__input" id="startDate" name="startDate" type="date" value={formFields.startDate} onChange={changeInput} />
            </Field>
            <Field label="End Date" htmlFor="endDate">
              <input className="admin-dash__input" id="endDate" name="endDate" type="date" value={formFields.endDate} onChange={changeInput} />
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
