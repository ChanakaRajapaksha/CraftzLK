import DateRangeFilter from "../../../Components/AdminDashboard/DateRangeFilter";
import { DATE_PRESETS } from "./reportUtils";

export default function ReportFilters({
  datePreset,
  onDatePresetChange,
  customStart,
  customEnd,
  onCustomChange,
  onDateApply,
  categoryId,
  onCategoryChange,
  categories,
  productId,
  onProductChange,
  products,
  showCategory = true,
  showProduct = true,
}) {
  return (
    <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters admin-dash__report-filters">
      <DateRangeFilter
        presets={DATE_PRESETS}
        value={datePreset}
        onChange={onDatePresetChange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomChange={onCustomChange}
        onApply={onDateApply}
      />

      {showCategory && (
        <select
          className="admin-dash__select"
          style={{ maxWidth: "12rem" }}
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => {
            const id = category._id || category.id;
            return (
              <option key={id} value={id}>
                {category.name}
              </option>
            );
          })}
        </select>
      )}

      {showProduct && (
        <select
          className="admin-dash__select"
          style={{ maxWidth: "14rem" }}
          value={productId}
          onChange={(event) => onProductChange(event.target.value)}
          aria-label="Filter by product"
        >
          <option value="all">All products</option>
          {products.map((product) => {
            const id = product._id || product.id;
            return (
              <option key={id} value={id}>
                {product.name}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}
