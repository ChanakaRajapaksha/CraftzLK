import { useRef, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import AdminThemeToggle from "../../../Components/AdminDashboard/AdminThemeToggle";
import { uploadImage, deleteData } from "../../../utils/api";
import {
  CURRENCY_OPTIONS,
  DECIMAL_FORMAT_OPTIONS,
  SETTINGS_TABS,
  TAX_RULE_OPTIONS,
  formatCurrencyPreview,
} from "./settingsFormDefaults";

function Field({ label, htmlFor, children, full = false, narrow = false, hint }) {
  const fieldClass = [
    "admin-dash__field",
    full && "admin-dash__field--full",
    narrow && "admin-dash__field--narrow",
  ].filter(Boolean).join(" ");

  return (
    <div className={fieldClass}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="admin-dash__hint">{hint}</p>}
    </div>
  );
}

function BrandAssetField({ label, asset, onChange, setAlertBox, accept = "image/*", variant = "logo" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const imageUrl = asset?.url || "";

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await uploadImage(`/api/settings/upload/${variant}`, formData);
      const nextAsset = res?.asset || { url: res?.url || "", publicId: "" };
      if (nextAsset.url) {
        onChange(nextAsset);
        setAlertBox?.({ open: true, error: false, msg: `${label} uploaded and saved.` });
      } else {
        setAlertBox?.({ open: true, error: true, msg: "Upload failed." });
      }
    } catch {
      setAlertBox?.({ open: true, error: true, msg: "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const res = await deleteData(`/api/settings/assets/${variant}`);
      const clearedAsset = res?.asset || { url: "", publicId: "" };
      onChange(clearedAsset);
      setAlertBox?.({ open: true, error: false, msg: `${label} removed.` });
    } catch {
      setAlertBox?.({ open: true, error: true, msg: `Failed to remove ${label.toLowerCase()}.` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`admin-dash__field admin-dash__settings-asset-field admin-dash__settings-asset-field--${variant}`}>
      <span className="admin-dash__label">{label}</span>
      <div className="admin-dash__settings-asset">
        <div className="admin-dash__settings-asset-preview">
          {imageUrl ? (
            <img src={imageUrl} alt={label} />
          ) : (
            <span className="admin-dash__settings-asset-empty">No image uploaded</span>
          )}
        </div>
        <div className="admin-dash__settings-asset-actions">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <button
            type="button"
            className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <FaCloudUploadAlt />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          {imageUrl && (
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
              disabled={uploading}
              onClick={handleRemove}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsForm({
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  onSubmit,
}) {
  const [tab, setTab] = useState("general");

  const changeGeneral = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const changeCurrency = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      currency: { ...prev.currency, [field]: value },
    }));
  };

  const changeTax = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      tax: { ...prev.tax, [field]: value },
    }));
  };

  const onCurrencyCodeChange = (e) => {
    const code = e.target.value;
    const match = CURRENCY_OPTIONS.find((item) => item.code === code);
    setFormFields((prev) => ({
      ...prev,
      currency: {
        ...prev.currency,
        code,
        symbol: match?.symbol || prev.currency.symbol,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.general?.storeName?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Store name is required." });
      setTab("general");
      return;
    }
    onSubmit(e);
  };

  const currencyPreview = formatCurrencyPreview(
    formFields.currency?.code,
    formFields.currency?.symbol,
    formFields.currency?.decimalFormat
  );

  return (
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
      <nav className="admin-dash__product-tabs" aria-label="Settings sections">
        {SETTINGS_TABS.map((item) => (
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
        {tab === "general" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Store name" htmlFor="storeName" full>
              <input
                className="admin-dash__input"
                id="storeName"
                value={formFields.general?.storeName || ""}
                onChange={(e) => changeGeneral("storeName", e.target.value)}
                placeholder="CraftzLK"
              />
            </Field>
            <div className="admin-dash__settings-assets-row">
              <BrandAssetField
                label="Logo"
                asset={formFields.general?.logo}
                onChange={(asset) => changeGeneral("logo", asset)}
                setAlertBox={setAlertBox}
              />
              <BrandAssetField
                label="Favicon"
                variant="favicon"
                asset={formFields.general?.favicon}
                onChange={(asset) => changeGeneral("favicon", asset)}
                setAlertBox={setAlertBox}
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
              />
            </div>
            <Field label="Contact email" htmlFor="contactEmail">
              <input
                className="admin-dash__input"
                id="contactEmail"
                type="email"
                value={formFields.general?.contactEmail || ""}
                onChange={(e) => changeGeneral("contactEmail", e.target.value)}
                placeholder="hello@craftzlk.com"
              />
            </Field>
            <Field label="Contact phone" htmlFor="contactPhone">
              <input
                className="admin-dash__input"
                id="contactPhone"
                value={formFields.general?.contactPhone || ""}
                onChange={(e) => changeGeneral("contactPhone", e.target.value)}
                placeholder="+94 71 526 4449"
              />
            </Field>
            <Field label="Contact address" htmlFor="contactAddress" full>
              <textarea
                className="admin-dash__textarea"
                id="contactAddress"
                rows={3}
                value={formFields.general?.contactAddress || ""}
                onChange={(e) => changeGeneral("contactAddress", e.target.value)}
                placeholder="Store address shown on invoices and contact pages"
              />
            </Field>
          </div>
        )}

        {tab === "currency" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Currency" htmlFor="currencyCode">
              <select
                className="admin-dash__select"
                id="currencyCode"
                value={formFields.currency?.code || "LKR"}
                onChange={onCurrencyCodeChange}
              >
                {CURRENCY_OPTIONS.map((item) => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Currency symbol" htmlFor="currencySymbol">
              <input
                className="admin-dash__input"
                id="currencySymbol"
                value={formFields.currency?.symbol || ""}
                onChange={(e) => changeCurrency("symbol", e.target.value)}
                placeholder="Rs"
              />
            </Field>
            <Field label="Decimal format" htmlFor="decimalFormat" narrow>
              <select
                className="admin-dash__select"
                id="decimalFormat"
                value={formFields.currency?.decimalFormat || "2"}
                onChange={(e) => changeCurrency("decimalFormat", e.target.value)}
              >
                {DECIMAL_FORMAT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </Field>
            <div className="admin-dash__field admin-dash__field--full">
              <p className="admin-dash__label">Preview</p>
              <p className="admin-dash__settings-preview">{currencyPreview}</p>
            </div>
          </div>
        )}

        {tab === "tax" && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <div className="admin-dash__field admin-dash__field--full">
              <label className="admin-dash__toggle">
                <input
                  type="checkbox"
                  checked={Boolean(formFields.tax?.enabled)}
                  onChange={(e) => changeTax("enabled", e.target.checked)}
                />
                <span>Enable tax calculation</span>
              </label>
            </div>
            <Field label="Tax rules" htmlFor="taxRules">
              <select
                className="admin-dash__select"
                id="taxRules"
                value={formFields.tax?.rules || "exclusive"}
                onChange={(e) => changeTax("rules", e.target.value)}
                disabled={!formFields.tax?.enabled}
              >
                {TAX_RULE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Tax percentage (%)" htmlFor="taxPercentage">
              <input
                className="admin-dash__input"
                id="taxPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formFields.tax?.percentage ?? 0}
                onChange={(e) => changeTax("percentage", e.target.value)}
                disabled={!formFields.tax?.enabled || formFields.tax?.rules === "none"}
              />
            </Field>
          </div>
        )}

        {tab === "appearance" && (
          <div className="admin-dash__form-grid">
            <Field
              label="Admin dashboard theme"
              full
              hint="Switch between light and dark mode for the admin panel. Your choice is saved in this browser."
            >
              <AdminThemeToggle compact />
            </Field>
          </div>
        )}

        <div className="admin-dash__product-form-actions">
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save settings"}
          </button>
        </div>
      </section>
    </form>
  );
}
