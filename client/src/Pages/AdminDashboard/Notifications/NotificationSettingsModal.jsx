import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdEmail, MdSms } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import NotificationController from "../../../controllers/notification.controller.js";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import NotificationSettingsForm from "./NotificationSettingsForm";
import {
  defaultNotificationSettings,
  settingsFromRecord,
  settingsToPayload,
} from "./notificationFormDefaults";
import { useModalBodyLock, useModalFormInit } from "../../../hooks/useModalFormLifecycle";

export default function NotificationSettingsModal({
  open,
  onClose,
  onSaved,
  setAlertBox,
}) {
  const [formFields, setFormFields] = useState({ ...defaultNotificationSettings });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useModalBodyLock(open, onClose);

  useModalFormInit(open, "notification-settings", () => {
    setLoading(true);
    NotificationController.getSettings()
      .then((res) => {
        if (res?.settings) {
          setFormFields(settingsFromRecord(res.settings));
        } else {
          setFormFields({ ...defaultNotificationSettings });
        }
      })
      .catch(() => {
        setAlertBox?.({
          open: true,
          error: true,
          msg: "Failed to load notification settings.",
        });
      })
      .finally(() => setLoading(false));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    NotificationController.updateSettings( settingsToPayload(formFields))
      .then((res) => {
        const saved = res?.settings ? settingsFromRecord(res.settings) : formFields;
        setFormFields(saved);
        setAlertBox?.({ open: true, error: false, msg: "Notification settings saved." });
        onSaved?.(saved);
        onClose?.();
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to save notification settings." });
      })
      .finally(() => setSaving(false));
  };

  if (!open) return null;

  return (
    <div
      className="admin-dash__settings-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dash__settings-modal admin-dash__settings-modal--notifications"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-settings-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Notification Management</p>
            <h2 id="notification-settings-modal-title" className="admin-dash__settings-modal-title">
              Notification settings
            </h2>
            <p className="admin-dash__settings-modal-sub">
              Enable and configure email and SMS channels for order and account notifications.
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close notification settings"
          >
            <IoClose aria-hidden />
          </button>
        </div>

        {!loading && (
          <div className="admin-dash__settings-modal-stats" aria-label="Channel status">
            <div className={`admin-dash__settings-modal-stat${formFields.email?.enabled ? " admin-dash__settings-modal-stat--on" : ""}`}>
              <span className="admin-dash__settings-modal-stat-icon">
                <MdEmail aria-hidden />
              </span>
              <span className="admin-dash__settings-modal-stat-label">Email</span>
              <span className="admin-dash__settings-modal-stat-value">
                {formFields.email?.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className={`admin-dash__settings-modal-stat${formFields.sms?.enabled ? " admin-dash__settings-modal-stat--on" : ""}`}>
              <span className="admin-dash__settings-modal-stat-icon">
                <MdSms aria-hidden />
              </span>
              <span className="admin-dash__settings-modal-stat-label">SMS</span>
              <span className="admin-dash__settings-modal-stat-value">
                {formFields.sms?.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="admin-dash__settings-modal-stat admin-dash__settings-modal-stat--wide">
              <span className="admin-dash__settings-modal-stat-icon">
                <IoShieldCheckmarkSharp aria-hidden />
              </span>
              <span className="admin-dash__settings-modal-stat-label">From address</span>
              <span className="admin-dash__settings-modal-stat-value">
                {formFields.email?.fromEmail || "—"}
              </span>
            </div>
          </div>
        )}

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading notification settings…" compact />
          ) : (
            <NotificationSettingsForm
              formId="notification-settings-form"
              variant="modal"
              formFields={formFields}
              setFormFields={setFormFields}
              setAlertBox={setAlertBox}
              isLoading={saving}
              onSubmit={handleSubmit}
              hideActions
            />
          )}
        </div>

        {!loading && (
          <div className="admin-dash__settings-modal-foot">
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="notification-settings-form"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save notification settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}