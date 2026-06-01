import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Switch from "@mui/material/Switch";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { COLLECTIONS_SORT_OPTIONS } from "./collectionsConstants";
import { formatRs } from "./collectionsUtils";

export function CollectionsFilterPanels({
  variant = "sidebar",
  inStockOnly,
  onInStockOnlyChange,
  priceRange,
  onPriceRangeChange,
  priceBounds,
  sortBy,
  onSortChange,
}) {
  const isDrawer = variant === "drawer";
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const selectedSortLabel =
    COLLECTIONS_SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Featured";

  const Section = ({ id, title, open, onToggle, trailing, children }) => {
    if (isDrawer) {
      return (
        <div className="collections-filter-panels__item">
          <button
            type="button"
            id={`${id}-trigger`}
            className="collections-filter-panels__trigger"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`${id}-panel`}
          >
            <span className="collections-filter-panels__trigger-label">{title}</span>
            <span className="collections-filter-panels__trigger-end">
              {trailing}
              {open ? <FaAngleUp aria-hidden /> : <FaAngleDown aria-hidden />}
            </span>
          </button>
          {open && (
            <div id={`${id}-panel`} className="collections-filter-panels__content" role="region">
              {children}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="collections-filters__section">
        <button
          type="button"
          className="collections-filters__heading"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span>{title}</span>
          {open ? <FaAngleUp aria-hidden /> : <FaAngleDown aria-hidden />}
        </button>
        {open && <div className="collections-filters__body">{children}</div>}
      </div>
    );
  };

  const availabilityBody = (
    <label className="collections-filters__toggle">
      <Switch
        checked={inStockOnly}
        onChange={(e) => onInStockOnlyChange(e.target.checked)}
        size="small"
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: "#c9a961" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#c9a961",
          },
        }}
      />
      <span>In stock</span>
    </label>
  );

  const priceBody = (
    <>
      <div className="collections-filters__slider">
        <RangeSlider
          value={priceRange}
          onInput={onPriceRangeChange}
          min={priceBounds.min}
          max={priceBounds.max}
          step={1}
        />
      </div>
      <div className="collections-filters__price-inputs">
        <label>
          <span className="collections-filters__input-label">Min</span>
          <input
            type="number"
            min={priceBounds.min}
            max={priceRange[1]}
            value={Math.round(priceRange[0])}
            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
          />
        </label>
        <label>
          <span className="collections-filters__input-label">Max</span>
          <input
            type="number"
            min={priceRange[0]}
            max={priceBounds.max}
            value={Math.round(priceRange[1])}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
          />
        </label>
      </div>
      <p className="collections-filters__price-hint">
        Rs {formatRs(priceRange[0])} – Rs {formatRs(priceRange[1])}
      </p>
    </>
  );

  const sortBody = (
    <ul className="collections-filter-panels__sort-list" role="listbox" aria-label="Sort products">
      {COLLECTIONS_SORT_OPTIONS.map((option) => (
        <li key={option.value} role="option" aria-selected={sortBy === option.value}>
          <button
            type="button"
            className={`collections-filter-panels__sort-option${
              sortBy === option.value ? " collections-filter-panels__sort-option--active" : ""
            }`}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );

  const panelsClass = isDrawer
    ? "collections-filter-panels collections-filter-panels--drawer"
    : "collections-filter-panels collections-filter-panels--sidebar";

  return (
    <div className={panelsClass}>
      <Section
        id="collections-availability"
        title="Availability"
        open={availabilityOpen}
        onToggle={() => setAvailabilityOpen((v) => !v)}
      >
        {availabilityBody}
      </Section>

      <Section
        id="collections-price"
        title="Price"
        open={priceOpen}
        onToggle={() => setPriceOpen((v) => !v)}
      >
        {priceBody}
      </Section>

      {isDrawer && onSortChange && (
        <Section
          id="collections-sort"
          title="Sort By:"
          open={sortOpen}
          onToggle={() => setSortOpen((v) => !v)}
          trailing={
            <span className="collections-filter-panels__sort-value">{selectedSortLabel}</span>
          }
        >
          {sortBody}
        </Section>
      )}
    </div>
  );
}

export default function CollectionsFilters(props) {
  return (
    <aside className="collections-filters" aria-label="Product filters">
      <CollectionsFilterPanels variant="sidebar" {...props} />
    </aside>
  );
}
