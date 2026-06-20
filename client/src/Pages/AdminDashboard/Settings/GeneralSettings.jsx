import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MdAttachMoney, MdEmail, MdStore } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { editData, fetchDataFromApi } from "../../../utils/api";
import SettingsForm from "./SettingsForm";
import {
  defaultSettingsFields,
  formatCurrencyPreview,
  settingsFromRecord,
  settingsToPayload,
} from "./settingsFormDefaults";
import { getSettingsSample } from "./settingsListUtils";

export default function GeneralSettings() {
  const { setAlertBox } = useOutletContext();
  const [formFields, setFormFields] = useState({ ...defaultSettingsFields });
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/settings")
      .then((res) => {
        if (res?.settings) {
          setFormFields(settingsFromRecord(res.settings));
          setUsingSampleData(false);
        } else {
          setFormFields(settingsFromRecord(getSettingsSample()));
          setUsingSampleData(true);
        }
      })
      .catch(() => {
        setFormFields(settingsFromRecord(getSettingsSample()));
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
    editData("/api/settings", settingsToPayload(formFields))
      .then((res) => {
        if (res) setFormFields(settingsFromRecord(res));
        setAlertBox?.({ open: true, error: false, msg: "Settings saved." });
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to save settings." });
      })
      .finally(() => setIsLoading(false));
  };

  const currencyPreview = formatCurrencyPreview(
    formFields.currency?.code,
    formFields.currency?.symbol,
    formFields.currency?.decimalFormat
  );

  return (
    <>
      <AdminPageHeader
        title="General Settings"
        subtitle="Configure store identity, currency, tax, and email delivery."
        breadcrumbs={[{ label: "Settings" }, { label: "General Settings" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdStore />} label="Store" value={formFields.general?.storeName || "—"} />
        <StatCard
          icon={<MdAttachMoney />}
          label="Currency"
          value={currencyPreview}
          gradient={["#8b6f47", "#b8860b"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Tax"
          value={
            formFields.tax?.enabled && formFields.tax?.rules !== "none"
              ? `${formFields.tax?.percentage || 0}%`
              : "Off"
          }
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdEmail />}
          label="SMTP"
          value={formFields.email?.smtpHost || "—"}
          gradient={["#4a5568", "#718096"]}
        />
      </div>

      {usingSampleData && (
        <p className="admin-dash__sample-banner admin-dash__sample-banner--standalone">
          Showing sample settings — connect the API to persist changes.
        </p>
      )}

      {loading ? (
        <p className="admin-dash__report-loading">Loading settings…</p>
      ) : (
        <SettingsForm
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
