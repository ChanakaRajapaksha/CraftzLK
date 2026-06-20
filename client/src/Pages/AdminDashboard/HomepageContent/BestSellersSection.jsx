import HomepageSectionShell, { Field } from "./HomepageSectionShell";
import { useHomepageSection } from "./useHomepageSection";

export default function BestSellersSection() {
  const { formFields, setFormFields, isLoading, usingSampleData, saveSection } =
    useHomepageSection("bestSellers");

  const submit = (e) => {
    e.preventDefault();
    saveSection({
      enabled: formFields.enabled,
      autoLimit: Number(formFields.autoLimit) || 10,
    });
  };

  return (
    <HomepageSectionShell
      title="Best Sellers"
      subtitle="Automatically ranked from paid and fulfilled order volume."
      sectionLabel="Best Sellers"
      formFields={formFields}
      setFormFields={setFormFields}
      isLoading={isLoading}
      onSubmit={submit}
    >
      {usingSampleData && (
        <p className="admin-dash__sample-banner">Using sample configuration until live data is saved.</p>
      )}

      <div className="admin-dash__homepage-info-panel">
        <h3 className="admin-dash__homepage-info-title">Automatic based on sales</h3>
        <p>
          Best sellers are calculated from order data — products with the highest total
          quantity sold appear first. No manual product selection is required.
        </p>
      </div>

      <div className="admin-dash__form-grid admin-dash__form-grid--2">
        <Field label="Products to show" htmlFor="autoLimit">
          <input
            className="admin-dash__input"
            id="autoLimit"
            type="number"
            min="1"
            max="50"
            value={formFields.autoLimit ?? 10}
            onChange={(e) =>
              setFormFields((prev) => ({ ...prev, autoLimit: e.target.value }))
            }
          />
        </Field>
      </div>
    </HomepageSectionShell>
  );
}
