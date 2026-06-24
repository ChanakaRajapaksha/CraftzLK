import { MdEmail, MdSms } from "react-icons/md";

function ReadOnlyField({ label, value }) {
  return (
    <div className="admin-dash__field">
      <span className="admin-dash__label">{label}</span>
      <p className="admin-dash__readonly-value">{value || "—"}</p>
    </div>
  );
}

export default function NotificationSettingsSummary({ formFields, onEdit }) {
  return (
    <>
      <div className="admin-dash__notification-channels admin-dash__notification-summary-channels">
        <section className="admin-dash__panel admin-dash__notification-channel">
        <div className="admin-dash__panel-head">
          <div className="admin-dash__notification-channel-title">
            <span className="admin-dash__notification-channel-icon admin-dash__notification-channel-icon--email">
              <MdEmail aria-hidden />
            </span>
            <div>
              <h2 className="admin-dash__panel-title">Email notifications</h2>
              <p className="admin-dash__panel-desc">Configure outgoing order and account emails.</p>
            </div>
          </div>
          <span
            className={`admin-dash__channel-badge admin-dash__channel-badge--email${
              formFields.email?.enabled ? "" : " admin-dash__channel-badge--off"
            }`}
          >
            {formFields.email?.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <ReadOnlyField label="From name" value={formFields.email?.fromName} />
          <ReadOnlyField label="From email" value={formFields.email?.fromEmail} />
          <div className="admin-dash__field admin-dash__field--full">
            <span className="admin-dash__label">Reply-to email</span>
            <p className="admin-dash__readonly-value">{formFields.email?.replyTo || "—"}</p>
          </div>
          <div className="admin-dash__field admin-dash__field--full">
            <span className="admin-dash__label">Email password</span>
            <p className="admin-dash__readonly-value">
              {formFields.email?.hasPassword ? "Configured (encrypted)" : "Not set"}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-dash__panel admin-dash__notification-channel">
        <div className="admin-dash__panel-head">
          <div className="admin-dash__notification-channel-title">
            <span className="admin-dash__notification-channel-icon admin-dash__notification-channel-icon--sms">
              <MdSms aria-hidden />
            </span>
            <div>
              <h2 className="admin-dash__panel-title">SMS notifications</h2>
              <p className="admin-dash__panel-desc">Configure text alerts for order updates.</p>
            </div>
          </div>
          <span
            className={`admin-dash__channel-badge admin-dash__channel-badge--sms${
              formFields.sms?.enabled ? "" : " admin-dash__channel-badge--off"
            }`}
          >
            {formFields.sms?.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div className="admin-dash__form-grid admin-dash__form-grid--2">
          <ReadOnlyField label="Sender ID" value={formFields.sms?.senderId} />
          <ReadOnlyField label="Provider" value={formFields.sms?.provider} />
        </div>
      </section>
      </div>

      {onEdit && (
        <div className="admin-dash__notification-summary-actions">
          <button type="button" className="admin-dash__btn" onClick={onEdit}>
            Edit notification settings
          </button>
        </div>
      )}
    </>
  );
}
