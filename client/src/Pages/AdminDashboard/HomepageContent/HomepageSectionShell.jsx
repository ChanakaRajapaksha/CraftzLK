import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function HomepageSectionShell({
  title,
  subtitle,
  sectionLabel,
  formFields,
  setFormFields,
  isLoading,
  onSubmit,
  hideStatus = false,
  children,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: "Homepage Content", to: `${ADMIN_BASE}/homepage` },
          { label: sectionLabel },
        ]}
      />

      <form className="admin-dash__product-form" onSubmit={handleSubmit}>
        <section className="admin-dash__panel admin-dash__product-panel">
          {!hideStatus && (
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <Field label="Section status" htmlFor="enabled">
              <select
                className="admin-dash__select admin-dash__select--compact"
                id="enabled"
                value={formFields.enabled ? "active" : "inactive"}
                onChange={(e) =>
                  setFormFields((prev) => ({
                    ...prev,
                    enabled: e.target.value === "active",
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          )}

          {children}

          <div className="admin-dash__product-form-actions">
            <button type="submit" className="admin-dash__btn" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save section"}
            </button>
          </div>
        </section>
      </form>
    </>
  );
}

export { Field };
