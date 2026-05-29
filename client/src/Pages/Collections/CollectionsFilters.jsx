import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Switch from "@mui/material/Switch";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { formatRs } from "./collectionsUtils";

export default function CollectionsFilters({
  inStockOnly,
  onInStockOnlyChange,
  priceRange,
  onPriceRangeChange,
  priceBounds,
}) {
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <aside className="collections-filters" aria-label="Product filters">
      <div className="collections-filters__section">
        <button
          type="button"
          className="collections-filters__heading"
          onClick={() => setAvailabilityOpen((v) => !v)}
          aria-expanded={availabilityOpen}
        >
          <span>Availability</span>
          {availabilityOpen ? <FaAngleUp aria-hidden /> : <FaAngleDown aria-hidden />}
        </button>

        {availabilityOpen && (
          <div className="collections-filters__body">
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
          </div>
        )}
      </div>

      <div className="collections-filters__section">
        <button
          type="button"
          className="collections-filters__heading"
          onClick={() => setPriceOpen((v) => !v)}
          aria-expanded={priceOpen}
        >
          <span>Price</span>
          {priceOpen ? <FaAngleUp aria-hidden /> : <FaAngleDown aria-hidden />}
        </button>

        {priceOpen && (
          <div className="collections-filters__body">
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
                  onChange={(e) =>
                    onPriceRangeChange([Number(e.target.value), priceRange[1]])
                  }
                />
              </label>
              <label>
                <span className="collections-filters__input-label">Max</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceBounds.max}
                  value={Math.round(priceRange[1])}
                  onChange={(e) =>
                    onPriceRangeChange([priceRange[0], Number(e.target.value)])
                  }
                />
              </label>
            </div>
            <p className="collections-filters__price-hint">
              Rs {formatRs(priceRange[0])} – Rs {formatRs(priceRange[1])}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
