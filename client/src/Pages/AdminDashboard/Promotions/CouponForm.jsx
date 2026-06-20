import { useState } from "react";
import { COUPON_FORM_TABS, formToPayload } from "./couponFormDefaults";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function CouponForm({
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  submitLabel = "Save coupon",
  onSubmit,
}) {
  const [tab, setTab] = useState("basic");

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.code?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Coupon code is required." });
      setTab("basic");
      return;
    }
    if (!formFields.discountValue) {
      setAlertBox?.({ open: true, error: true, msg: "Discount value is required." });
      setTab("basic");
      return;
    }
    onSubmit(e, formToPayload(formFields));
  };

  return (
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
      <nav className="admin-dash__product-tabs" aria-label="Coupon form sections">
        {COUPON_FORM_TABS.map((item) => (
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
            <Field label="Coupon Code" htmlFor="code">
              <input
                className="admin-dash__input"
                id="code"
                name="code"
                value={formFields.code}
                onChange={changeInput}
                placeholder="WELCOME10"
              />
            </Field>
            <Field label="Status" htmlFor="status">
              <select className="admin-dash__select admin-dash__select--compact" id="status" name="status" value={formFields.status} onChange={changeInput}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Discount Type" htmlFor="discountType">
              <select className="admin-dash__select" id="discountType" name="discountType" value={formFields.discountType} onChange={changeInput}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </Field>
            <Field label={formFields.discountType === "fixed" ? "Discount Amount (Rs.)" : "Discount (%)"} htmlFor="discountValue">
              <input
                className="admin-dash__input"
                id="discountValue"
                name="discountValue"
                type="number"
                min="0"
                value={formFields.discountValue}
                onChange={changeInput}
                placeholder={formFields.discountType === "fixed" ? "500" : "10"}
              />
            </Field>
          </div>
        )}

        {tab === "rules" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Minimum Order Value (Rs.)" htmlFor="minOrderValue">
              <input className="admin-dash__input" id="minOrderValue" name="minOrderValue" type="number" min="0" value={formFields.minOrderValue} onChange={changeInput} placeholder="2500" />
            </Field>
            <Field label="Maximum Discount (Rs.)" htmlFor="maxDiscount">
              <input className="admin-dash__input" id="maxDiscount" name="maxDiscount" type="number" min="0" value={formFields.maxDiscount} onChange={changeInput} placeholder="1500" />
            </Field>
            <Field label="Start Date" htmlFor="startDate">
              <input className="admin-dash__input" id="startDate" name="startDate" type="date" value={formFields.startDate} onChange={changeInput} />
            </Field>
            <Field label="Expiry Date" htmlFor="expiryDate">
              <input className="admin-dash__input" id="expiryDate" name="expiryDate" type="date" value={formFields.expiryDate} onChange={changeInput} />
            </Field>
            <Field label="Usage Limit" htmlFor="usageLimit">
              <input className="admin-dash__input" id="usageLimit" name="usageLimit" type="number" min="0" value={formFields.usageLimit} onChange={changeInput} placeholder="0 = unlimited" />
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
