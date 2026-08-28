import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import NotificationController from "../../../controllers/notification.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { NotificationTemplateForm } from "./NotificationSettingsForm";
import {
  defaultTemplateFields,
  getCategoryLabel,
  previewTemplateBody,
  templateFromRecord,
  templateToPayload,
} from "./notificationFormDefaults";

export default function EditNotificationTemplate() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [templateMeta, setTemplateMeta] = useState(null);
  const [formFields, setFormFields] = useState({ ...defaultTemplateFields });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingTemplate(true);
    NotificationController.getTemplateById(id)
      .then((res) => {
        if (res) {
          setTemplateMeta(res);
          setFormFields(templateFromRecord(res));
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load template." });
      })
      .finally(() => setLoadingTemplate(false));
  }, [id, setAlertBox]);

  const submit = (e) => {
    e.preventDefault();

    setIsLoading(true);
    NotificationController.updateTemplate(id, templateToPayload(formFields))
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Template updated." });
        navigate(`${ADMIN_BASE}/notifications/templates`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update template." });
      })
      .finally(() => setIsLoading(false));
  };

  const preview = previewTemplateBody(
    formFields.body,
    "email",
    formFields.subject
  );

  if (loadingTemplate) {
    return (
      <AdminPageHeader
        title="Edit Template"
        subtitle="Loading template details…"
        breadcrumbs={[
          { label: "Notification Management", to: `${ADMIN_BASE}/notifications` },
          { label: "Templates", to: `${ADMIN_BASE}/notifications/templates` },
          { label: "Edit" },
        ]}
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit ${templateMeta?.name || "Template"}`}
        subtitle={
          templateMeta
            ? `${getCategoryLabel(templateMeta.category)} · ${templateMeta.code}`
            : "Email notification template"
        }
        breadcrumbs={[
          { label: "Notification Management", to: `${ADMIN_BASE}/notifications` },
          { label: "Templates", to: `${ADMIN_BASE}/notifications/templates` },
          { label: "Edit" },
        ]}
      />

      {templateMeta?.description && (
        <section className="admin-dash__panel admin-dash__notification-template-meta">
          <p className="admin-dash__panel-desc">{templateMeta.description}</p>
        </section>
      )}

      {preview && (
        <section className="admin-dash__panel admin-dash__notification-preview">
          <div className="admin-dash__panel-head">
            <div>
              <h2 className="admin-dash__panel-title">Preview</h2>
              <p className="admin-dash__panel-desc">Rendered with sample placeholder values</p>
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
