import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { NotificationTemplateForm } from "./NotificationSettingsForm";
import {
  defaultTemplateFields,
  getChannelLabel,
  previewTemplateBody,
  templateFromRecord,
  templateToPayload,
} from "./notificationFormDefaults";
import {
  getNotificationTemplateSampleData,
  isSampleNotificationTemplateId,
} from "./notificationListUtils";

export default function EditNotificationTemplate() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [templateMeta, setTemplateMeta] = useState(null);
  const [formFields, setFormFields] = useState({ ...defaultTemplateFields });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSampleNotificationTemplateId(id)) {
      const sample = getNotificationTemplateSampleData().find((item) => (item._id || item.id) === id);
      if (sample) {
        setTemplateMeta(sample);
        setFormFields(templateFromRecord(sample));
      }
      return;
    }

    fetchDataFromApi(`/api/notifications/templates/${id}`)
      .then((res) => {
        if (res) {
          setTemplateMeta(res);
          setFormFields(templateFromRecord(res));
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load template." });
      });
  }, [id, setAlertBox]);

  const submit = (e) => {
    e.preventDefault();

    if (isSampleNotificationTemplateId(id)) {
      setAlertBox?.({ open: true, error: false, msg: "Sample template updated locally." });
      navigate(`${ADMIN_BASE}/notifications/templates`);
      return;
    }

    setIsLoading(true);
    editData(`/api/notifications/templates/${id}`, templateToPayload(formFields))
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Template updated." });
        navigate(`${ADMIN_BASE}/notifications/templates`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update template." });
      })
      .finally(() => setIsLoading(false));
  };

  const preview = previewTemplateBody(formFields.body, templateMeta?.channel);

  return (
    <>
      <AdminPageHeader
        title={`Edit ${templateMeta?.name || "Template"}`}
        subtitle={`${getChannelLabel(templateMeta?.channel)} notification template`}
        breadcrumbs={[
          { label: "Notification Management", to: `${ADMIN_BASE}/notifications` },
          { label: "Templates", to: `${ADMIN_BASE}/notifications/templates` },
          { label: "Edit" },
        ]}
      />

      {preview && (
        <section className="admin-dash__panel admin-dash__notification-preview">
          <div className="admin-dash__panel-head">
            <div>
              <h2 className="admin-dash__panel-title">Preview</h2>
              <p className="admin-dash__panel-desc">Sample output with placeholder values</p>
            </div>
          </div>
          <pre className="admin-dash__notification-preview-body">{preview}</pre>
        </section>
      )}

      <NotificationTemplateForm
        templateMeta={templateMeta}
        formFields={formFields}
        setFormFields={setFormFields}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Update template"
        onSubmit={submit}
      />
    </>
  );
}
