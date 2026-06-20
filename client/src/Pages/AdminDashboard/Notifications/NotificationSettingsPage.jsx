import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MdEmail, MdSms } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import NotificationSettingsForm from "./NotificationSettingsForm";
import {
  defaultNotificationSettings,
  settingsFromRecord,
  settingsToPayload,
} from "./notificationFormDefaults";
import { getNotificationSettingsSample } from "./notificationListUtils";

export default function NotificationSettingsPage() {
  const { setAlertBox } = useOutletContext();
  const [formFields, setFormFields] = useState({ ...defaultNotificationSettings });
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/notifications/settings")
      .then((res) => {
        if (res?.settings) {
          setFormFields(settingsFromRecord(res.settings));
          setUsingSampleData(false);
        } else {
          setFormFields(settingsFromRecord(getNotificationSettingsSample()));
          setUsingSampleData(true);
        }
      })
      .catch(() => {
        setFormFields(settingsFromRecord(getNotificationSettingsSample()));
        setUsingSampleData(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (usingSampleData) {
      setAlertBox?.({ open: true, error: false, msg: "Sample settings saved locally." });
      return;
    }
    setIsLoading(true);
    editData("/api/notifications/settings", settingsToPayload(formFields))
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Notification settings saved." });
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to save settings." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        subtitle="Enable and configure email and SMS notification channels."
        breadcrumbs={[
          { label: "Notification Management" },
          { label: "Notifications" },
        ]}
        action={
          <Link to={`${ADMIN_BASE}/notifications/templates`} className="admin-dash__btn admin-dash__btn--ghost">
            View templates
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard
          icon={<MdEmail />}
          label="Email"
          value={formFields.email?.enabled ? "Enabled" : "Disabled"}
          gradient={formFields.email?.enabled ? ["#5a7a5e", "#7a9a7e"] : ["#6b5344", "#9a8b78"]}
        />
        <StatCard
          icon={<MdSms />}
          label="SMS"
          value={formFields.sms?.enabled ? "Enabled" : "Disabled"}
          gradient={formFields.sms?.enabled ? ["#8b6f47", "#b8860b"] : ["#6b5344", "#9a8b78"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="From address"
          value={formFields.email?.fromEmail || "—"}
          gradient={["#4a5568", "#718096"]}
        />
      </div>

      {usingSampleData && (
        <p className="admin-dash__sample-banner admin-dash__sample-banner--standalone">
          Showing sample notification settings — connect the API to persist changes.
        </p>
      )}

      {loading ? (
        <p className="admin-dash__report-loading">Loading notification settings…</p>
      ) : (
        <NotificationSettingsForm
          formFields={formFields}
          setFormFields={setFormFields}
          setAlertBox={setAlertBox}
          isLoading={isLoading}
          onSubmit={submit}
        />
      )}
    </>
  );
}
