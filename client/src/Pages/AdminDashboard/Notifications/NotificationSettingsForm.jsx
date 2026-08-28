import { MdEmail, MdSms } from "react-icons/md";
import { getPlaceholdersForTemplate } from "./notificationFormDefaults";

function Field({ label, htmlFor, children, full = false, hint }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="admin-dash__hint">{hint}</p>}
    </div>
  );
}

export default function NotificationSettingsForm({
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  onSubmit,
  submitLabel = "Save notification settings",
  formId,
  variant = "page",
  hideActions = false,
}) {
  const changeEmail = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      email: { ...prev.email, [field]: value },
    }));
  };

  const changeSms = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      sms: { ...prev.sms, [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formFields.email?.enabled && !formFields.email?.fromEmail?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "From email is required when email notifications are enabled." });
      return;
    }
    onSubmit(e);
  };

  return (
    <form
      id={formId}
      className={`admin-dash__product-form${variant === "modal" ? " admin-dash__notification-form--modal" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-dash__notification-channels">
        <section className="admin-dash__panel admin-dash__notification-channel">
          <div className="admin-dash__panel-head">
            <div className="admin-dash__notification-channel-title">
              {variant === "modal" && (
                <span className="admin-dash__notification-channel-icon admin-dash__notification-channel-icon--email">
                  <MdEmail aria-hidden />
                </span>
              )}
              <div>
                <h2 className="admin-dash__panel-title">Email notifications</h2>
                <p className="admin-dash__panel-desc">Configure outgoing order and account emails.</p>
              </div>
            </div>
            <label className="admin-dash__toggle">
              <input
                type="checkbox"
                checked={Boolean(formFields.email?.enabled)}
                onChange={(e) => changeEmail("enabled", e.target.checked)}
              />
              <span>{formFields.email?.enabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="From name" htmlFor="email-fromName">
              <input
                className="admin-dash__input"
                id="email-fromName"
                value={formFields.email?.fromName || ""}
                onChange={(e) => changeEmail("fromName", e.target.value)}
                placeholder="CraftzLK"
                disabled={!formFields.email?.enabled}
              />
            </Field>
            <Field label="From email" htmlFor="email-fromEmail">
              <input
                className="admin-dash__input"
                id="email-fromEmail"
                type="email"
                value={formFields.email?.fromEmail || ""}
                onChange={(e) => changeEmail("fromEmail", e.target.value)}
                placeholder="hello@craftzlk.com"
                disabled={!formFields.email?.enabled}
              />
            </Field>
            <Field label="Reply-to email" htmlFor="email-replyTo" full>
              <input
                className="admin-dash__input"
                id="email-replyTo"
                type="email"
                value={formFields.email?.replyTo || ""}
                onChange={(e) => changeEmail("replyTo", e.target.value)}
                placeholder="support@craftzlk.com"
                disabled={!formFields.email?.enabled}
              />
            </Field>
            <Field
              label="Email password (SMTP / app password)"
              htmlFor="email-emailPassword"
              full
              hint={
                formFields.email?.hasPassword
                  ? "Leave blank to keep the current encrypted password. Used as EMAIL_PASS when sending mail."
                  : "Stored encrypted in the database. Used with From email as EMAIL_USER when sending mail."
              }
            >
              <input
                className="admin-dash__input"
                id="email-emailPassword"
                type="password"
                value={formFields.email?.emailPassword || ""}
                onChange={(e) => changeEmail("emailPassword", e.target.value)}
                placeholder={formFields.email?.hasPassword ? "••••••••" : "Enter email app password"}
                disabled={!formFields.email?.enabled}
                autoComplete="new-password"
              />
            </Field>
          </div>
        </section>

        <section className="admin-dash__panel admin-dash__notification-channel">
          <div className="admin-dash__panel-head">
            <div className="admin-dash__notification-channel-title">
              {variant === "modal" && (
                <span className="admin-dash__notification-channel-icon admin-dash__notification-channel-icon--sms">
                  <MdSms aria-hidden />
                </span>
              )}
              <div>
                <h2 className="admin-dash__panel-title">SMS notifications</h2>
                <p className="admin-dash__panel-desc">Configure text alerts for order updates.</p>
              </div>
            </div>
            <label className="admin-dash__toggle">
              <input
                type="checkbox"
                checked={Boolean(formFields.sms?.enabled)}
                onChange={(e) => changeSms("enabled", e.target.checked)}
              />
              <span>{formFields.sms?.enabled ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Sender ID" htmlFor="sms-senderId">
              <input
                className="admin-dash__input"
                id="sms-senderId"
                value={formFields.sms?.senderId || ""}
                onChange={(e) => changeSms("senderId", e.target.value)}
                placeholder="CraftzLK"
                disabled={!formFields.sms?.enabled}
              />
            </Field>
            <Field label="Provider" htmlFor="sms-provider">
              <input
                className="admin-dash__input"
                id="sms-provider"
                value={formFields.sms?.provider || ""}
                onChange={(e) => changeSms("provider", e.target.value)}
                placeholder="Dialog, Mobitel, etc."
                disabled={!formFields.sms?.enabled}
              />
            </Field>
          </div>
        </section>
      </div>

      {!hideActions && (
        <div className="admin-dash__product-form-actions">
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

export function NotificationTemplateForm({
  templateMeta,
  formFields,
  setFormFields,
  setAlertBox,
  isLoading = false,
  submitLabel = "Save template",
  onSubmit,
}) {
  const placeholders = getPlaceholdersForTemplate(templateMeta);

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Template name is required." });
      return;
    }
    if (!formFields.body?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Message body is required." });
      return;
    }
    if (!formFields.subject?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Email subject is required." });
      return;
    }
    onSubmit(e);
  };

  return (
    <form className="admin-dash__product-form" onSubmit={handleSubmit}>
      <section className="admin-dash__panel admin-dash__product-panel">
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <Field label="Template name" htmlFor="name" full>
            <input
              className="admin-dash__input"
              id="name"
              name="name"
              value={formFields.name}
              onChange={changeInput}
              placeholder="Order Confirmation"
            />
          </Field>
          <Field label="Template code">
            <input
              className="admin-dash__input"
              value={templateMeta?.code || ""}
              readOnly
              disabled
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
          <Field label="Subject" htmlFor="subject" full>
            <input
              className="admin-dash__input"
              id="subject"
              name="subject"
              value={formFields.subject}
              onChange={changeInput}
              placeholder="Order Confirmation — CraftzLK"
            />
          </Field>
          <Field label="Message body" htmlFor="body" full>
            <textarea
              className="admin-dash__textarea admin-dash__textarea--notification"
              id="body"
              name="body"
              rows={10}
              value={formFields.body}
              onChange={changeInput}
              placeholder="Your order #{{orderNumber}} has been received"
            />
          </Field>
          <div className="admin-dash__field admin-dash__field--full">
            <p className="admin-dash__label">Available placeholders</p>
            <div className="admin-dash__notification-placeholders">
              {placeholders.map((token) => (
                <code key={token} className="admin-dash__slug-code">{token}</code>
              ))}
            </div>
          </div>
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
