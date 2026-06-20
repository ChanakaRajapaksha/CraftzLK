import ProductSortPicker from "./ProductSortPicker";
import HomepageSectionShell from "./HomepageSectionShell";
import { useHomepageSection } from "./useHomepageSection";

export default function FeaturedProductsSection() {
  const { formFields, setFormFields, isLoading, usingSampleData, saveSection } =
    useHomepageSection("featuredProducts");

  const submit = (e) => {
    e.preventDefault();
    saveSection({
      enabled: formFields.enabled,
      productIds: formFields.productIds || [],
      productNames: formFields.productNames || [],
    });
  };

  return (
    <HomepageSectionShell
      title="Featured Products"
      subtitle="Select and order products for the homepage featured rail."
      sectionLabel="Featured Products"
      formFields={formFields}
      setFormFields={setFormFields}
      isLoading={isLoading}
      onSubmit={submit}
    >
      {usingSampleData && (
        <p className="admin-dash__sample-banner">Using sample configuration until live data is saved.</p>
      )}
      <ProductSortPicker
        productIds={formFields.productIds || []}
        productNames={formFields.productNames || []}
        onChange={({ productIds, productNames }) =>
          setFormFields((prev) => ({ ...prev, productIds, productNames }))
        }
        searchPlaceholder="Search products for featured section…"
      />
    </HomepageSectionShell>
  );
}
