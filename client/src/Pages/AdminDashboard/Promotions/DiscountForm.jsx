import { useEffect, useState } from "react";
import { DISCOUNT_FORM_TABS, DISCOUNT_TYPES, formToPayload } from "./discountFormDefaults";
import { fetchDataFromApi } from "../../../utils/api";

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
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchDataFromApi("/api/products").then((res) => {
      const list = res?.products || res?.productList || res || [];
      setProducts(Array.isArray(list) ? list : []);
    }).catch(() => setProducts([]));
  }, []);

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
    const pid = product._id || product.id;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Discount name is required." });
      setTab("basic");
      return;
    }
    if (formFields.type === "product" && !(formFields.productIds || []).length) {
      setAlertBox?.({ open: true, error: true, msg: "Select at least one product." });
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
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
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
            <label className="admin-dash__label">Select Products</label>
            <div className="admin-dash__checkbox-list">
              {products.length === 0 ? (
                <p className="admin-dash__hint">No products loaded. Add products first or use sample data on the list page.</p>
              ) : (
                products.slice(0, 50).map((product) => {
                  const pid = product._id || product.id;
                  const checked = (formFields.productIds || []).includes(pid);
                  return (
                    <label key={pid} className="admin-dash__checkbox-item">
                      <input type="checkbox" checked={checked} onChange={() => toggleProduct(product)} />
                      <span>{product.name}</span>
                    </label>
                  );
                })
              )}
            </div>
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
          <p className="admin-dash__hint">Seasonal sales apply store-wide during the scheduled period. Add a description on the Details tab.</p>
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
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : submitLabel}
          </button>
        </div>
      </section>
    </form>
  );
}
