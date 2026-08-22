import { useState } from "react";
import {
  defaultShippingMethodFields,
  formToPayload,
  SHIPPING_ZONES,
} from "./shippingFormDefaults";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function ShippingMethodForm({
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  submitLabel = "Save method",
  variant = "page",
  onSubmit,
}) {
  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const toggleZone = (zone) => {
    setFormFields((prev) => {
      const zones = [...(prev.zones || [])];
      const index = zones.indexOf(zone);
      if (index >= 0) zones.splice(index, 1);
      else zones.push(zone);
      return { ...prev, zones };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Method name is required." });
      return;
    }
    if (!(formFields.zones || []).length) {
      setAlertBox?.({ open: true, error: true, msg: "Select at least one shipping zone." });
      return;
    }
    onSubmit(e, formToPayload(formFields));
  };

  return (
    <form
      id={variant === "modal" ? "shipping-method-form-modal" : undefined}
      className="admin-dash__product-form"
      onSubmit={handleSubmit}
    >
      <section className="admin-dash__panel admin-dash__product-panel">
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <Field label="Name" htmlFor="name" full>
            <input
              className="admin-dash__input"
              id="name"
              name="name"
              value={formFields.name}
              onChange={changeInput}
              placeholder="Standard Delivery"
            />
          </Field>
          <Field label="Customer cost (Rs.)" htmlFor="cost">
            <input
              className="admin-dash__input"
              id="cost"
              name="cost"
              type="number"
              min="0"
              value={formFields.cost}
              onChange={changeInput}
              placeholder="350"
            />
          </Field>
          <Field label="Actual shipping cost (Rs.)" htmlFor="actualShippingCost">
            <input
              className="admin-dash__input"
              id="actualShippingCost"
              name="actualShippingCost"
              type="number"
              min="0"
              value={formFields.actualShippingCost}
              onChange={changeInput}
              placeholder="250"
            />
          </Field>
          <Field label="Delivery time" htmlFor="deliveryTime">
            <input
              className="admin-dash__input"
              id="deliveryTime"
              name="deliveryTime"
              value={formFields.deliveryTime}
              onChange={changeInput}
              placeholder="3–5 business days"
            />
          </Field>
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
          <div className="admin-dash__field admin-dash__field--full">
            <label className="admin-dash__label">Shipping zones</label>
            <div className="admin-dash__shipping-zones">
              {SHIPPING_ZONES.map((zone) => {
                const checked = (formFields.zones || []).includes(zone);
                return (
                  <label key={zone} className="admin-dash__checkbox-item">
                    <input type="checkbox" checked={checked} onChange={() => toggleZone(zone)} />
                    <span>{zone}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

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
