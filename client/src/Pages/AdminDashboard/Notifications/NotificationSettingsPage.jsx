import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MdEmail, MdSettings, MdSms } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import NotificationSettingsModal from "./NotificationSettingsModal";
import NotificationSettingsSummary from "./NotificationSettingsSummary";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import {
  defaultNotificationSettings,
  settingsFromRecord,
} from "./notificationFormDefaults";

export default function NotificationSettingsPage() {
  const { setAlertBox } = useOutletContext();
  const [formFields, setFormFields] = useState({ ...defaultNotificationSettings });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = () => {
    setLoading(true);
    fetchDataFromApi("/api/notifications/settings")
      .then((res) => {
        if (res?.settings) {
          setFormFields(settingsFromRecord(res.settings));
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
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="admin-dash__page-actions">
            <button
              type="button"
              className="admin-dash__btn"
              onClick={() => setModalOpen(true)}
            >
              <MdSettings aria-hidden />
              Configure channels
            </button>
            <Link to={`${ADMIN_BASE}/notifications/templates`} className="admin-dash__btn admin-dash__btn--ghost">
              View templates
            </Link>
          </div>
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

      {loading ? (
        <AdminLoadingState message="Loading notification settings…" />
      ) : (
        <NotificationSettingsSummary
          formFields={formFields}
          onEdit={() => setModalOpen(true)}
        />
      )}

      <NotificationSettingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(saved) => setFormFields(saved)}
        setAlertBox={setAlertBox}
      />
    </>
  );
}
