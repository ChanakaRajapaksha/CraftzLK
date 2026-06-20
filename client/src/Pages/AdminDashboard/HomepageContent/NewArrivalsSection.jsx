import ProductSortPicker from "./ProductSortPicker";
import HomepageSectionShell, { Field } from "./HomepageSectionShell";
import { useHomepageSection } from "./useHomepageSection";

export default function NewArrivalsSection() {
  const { formFields, setFormFields, isLoading, usingSampleData, saveSection } =
    useHomepageSection("newArrivals");

  const submit = (e) => {
    e.preventDefault();
    saveSection({
      enabled: formFields.enabled,
      mode: formFields.mode || "auto",
      productIds: formFields.productIds || [],
      productNames: formFields.productNames || [],
      autoLimit: Number(formFields.autoLimit) || 10,
    });
  };

  const isManual = formFields.mode === "manual";

  return (
    <HomepageSectionShell
      title="New Arrivals"
      subtitle="Show latest products automatically or curate a manual list."
      sectionLabel="New Arrivals"
      formFields={formFields}
      setFormFields={setFormFields}
      isLoading={isLoading}
      hideStatus
      onSubmit={submit}
    >
      {usingSampleData && (
        <p className="admin-dash__sample-banner">Using sample configuration until live data is saved.</p>
      )}

      <div className="admin-dash__form-grid admin-dash__form-grid--2 admin-dash__homepage-new-arrivals-grid">
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
        <Field label="Selection mode" htmlFor="mode">
          <select
            className="admin-dash__select"
            id="mode"
            value={formFields.mode || "auto"}
            onChange={(e) => setFormFields((prev) => ({ ...prev, mode: e.target.value }))}
          >
            <option value="auto">Automatic — newest products</option>
            <option value="manual">Manual — select products</option>
          </select>
        </Field>
        {!isManual && (
          <Field label="Product limit" htmlFor="autoLimit">
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
        )}
      </div>

      {!isManual && (
        <p className="admin-dash__hint admin-dash__homepage-mode-hint">
          New arrivals will automatically show the most recently added products (up to the limit above).
        </p>
      )}

      {isManual && (
        <ProductSortPicker
          productIds={formFields.productIds || []}
          productNames={formFields.productNames || []}
          onChange={({ productIds, productNames }) =>
            setFormFields((prev) => ({ ...prev, productIds, productNames }))
          }
          searchPlaceholder="Search products for new arrivals…"
        />
      )}
    </HomepageSectionShell>
  );
}
