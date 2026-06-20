import ProductSortPicker from "./ProductSortPicker";
import HomepageSectionShell from "./HomepageSectionShell";
import { useHomepageSection } from "./useHomepageSection";

export default function TrendingProductsSection() {
  const { formFields, setFormFields, isLoading, usingSampleData, saveSection } =
    useHomepageSection("trendingProducts");

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
      title="Trending Products"
      subtitle="Choose products displayed in the trending now section."
      sectionLabel="Trending Products"
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
        searchPlaceholder="Search products for trending section…"
      />
    </HomepageSectionShell>
  );
}
