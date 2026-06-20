import {
  defaultPaymentMethodFields,
  formToPayload,
  PAYMENT_METHOD_CODES,
} from "./paymentFormDefaults";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function PaymentMethodForm({
  methodCode,
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  submitLabel = "Save method",
  onSubmit,
}) {
  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Method name is required." });
      return;
    }
    onSubmit(e, formToPayload(formFields));
  };

  const isBankTransfer = methodCode === PAYMENT_METHOD_CODES.bank_transfer;

  return (
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
      <section className="admin-dash__panel admin-dash__product-panel">
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <Field label="Display name" htmlFor="name" full>
            <input
              className="admin-dash__input"
              id="name"
              name="name"
              value={formFields.name}
              onChange={changeInput}
              placeholder="Cash on Delivery"
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

          <Field label="Customer instructions" htmlFor="description" full>
            <textarea
              className="admin-dash__textarea"
              id="description"
              name="description"
              rows={3}
              value={formFields.description}
              onChange={changeInput}
              placeholder="Instructions shown at checkout for this payment method…"
            />
          </Field>

          {isBankTransfer && (
            <>
              <Field label="Bank name" htmlFor="bankName">
                <input
                  className="admin-dash__input"
                  id="bankName"
                  name="bankName"
                  value={formFields.bankName}
                  onChange={changeInput}
                  placeholder="Commercial Bank"
                />
              </Field>
              <Field label="Account name" htmlFor="accountName">
                <input
                  className="admin-dash__input"
                  id="accountName"
                  name="accountName"
                  value={formFields.accountName}
                  onChange={changeInput}
                  placeholder="CraftzLK Pvt Ltd"
                />
              </Field>
              <Field label="Account number" htmlFor="accountNumber" full>
                <input
                  className="admin-dash__input"
                  id="accountNumber"
                  name="accountNumber"
                  value={formFields.accountNumber}
                  onChange={changeInput}
                  placeholder="1234567890"
                />
              </Field>
            </>
          )}
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

export { defaultPaymentMethodFields };
