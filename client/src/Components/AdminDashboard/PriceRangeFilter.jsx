import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

function formatRs(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-LK");
}

export function getProductPriceBounds(products, fallback = { min: 500, max: 25000 }) {
  const prices = (products || [])
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price) && price >= 0);

  if (!prices.length) return fallback;

  let min = Math.min(...prices);
  let max = Math.max(...prices);

  if (min === max) {
    min = Math.max(0, min - 500);
    max += 500;
  }

  min = Math.floor(min / 100) * 100;
  max = Math.ceil(max / 100) * 100;

  if (max <= min) max = min + 500;

  return { min, max };
}

export default function PriceRangeFilter({ bounds, value, onApply }) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState([bounds.min, bounds.max]);
  const ref = useRef(null);

  const step = useMemo(() => {
    const span = bounds.max - bounds.min;
    if (span <= 2000) return 50;
    if (span <= 10000) return 100;
    return 500;
  }, [bounds.max, bounds.min]);

  const appliedMin = value?.[0] ?? bounds.min;
  const appliedMax = value?.[1] ?? bounds.max;

  const isFiltered = Boolean(
    value && (value[0] > bounds.min || value[1] < bounds.max)
  );

  const isDraftDirty = draftRange[0] !== appliedMin || draftRange[1] !== appliedMax;

  useEffect(() => {
    if (!open) {
      setDraftRange([appliedMin, appliedMax]);
    }
  }, [open, appliedMin, appliedMax]);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = () => {
    setOpen((current) => {
      if (!current) {
        setDraftRange([appliedMin, appliedMax]);
      }
      return !current;
    });
  };

  const handleApply = () => {
    const [min, max] = draftRange;
    if (min <= bounds.min && max >= bounds.max) {
      onApply(null);
    } else {
      onApply([min, max]);
    }
    setOpen(false);
  };

  const handleReset = () => {
    setDraftRange([bounds.min, bounds.max]);
    onApply(null);
    setOpen(false);
  };

  const triggerLabel = isFiltered
    ? `Rs ${formatRs(value[0])} – Rs ${formatRs(value[1])}`
    : "All prices";

  return (
    <div className={`admin-dash__price-filter${isFiltered ? " admin-dash__price-filter--active" : ""}`} ref={ref}>
      <button
        type="button"
        className="admin-dash__price-filter-trigger"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Filter by price range"
      >
        <span className="admin-dash__price-filter-trigger-label">{triggerLabel}</span>
        <FaChevronDown className="admin-dash__price-filter-chevron" aria-hidden />
      </button>

      {open && (
        <div className="admin-dash__price-filter-popup" role="dialog" aria-label="Price range filter">
          <div className="admin-dash__price-filter-head">
            <p className="admin-dash__price-filter-title">Price range</p>
            {isFiltered && (
              <button type="button" className="admin-dash__price-filter-clear" onClick={handleReset}>
                Clear
              </button>
            )}
          </div>

          <div className="admin-dash__price-filter-bounds" aria-hidden="true">
            <span>Rs {formatRs(bounds.min)}</span>
            <span>Rs {formatRs(bounds.max)}</span>
          </div>

          <div className="admin-dash__price-filter-slider">
            <RangeSlider
              value={draftRange}
              onInput={setDraftRange}
              min={bounds.min}
              max={bounds.max}
              step={step}
            />
          </div>

          <div className="admin-dash__price-filter-values">
            <div className="admin-dash__price-filter-value">
              <span className="admin-dash__price-filter-label">Min</span>
              <strong>Rs {formatRs(draftRange[0])}</strong>
            </div>
            <div className="admin-dash__price-filter-value admin-dash__price-filter-value--end">
              <span className="admin-dash__price-filter-label">Max</span>
              <strong>Rs {formatRs(draftRange[1])}</strong>
            </div>
          </div>

          <button
            type="button"
            className="admin-dash__btn admin-dash__btn--sm admin-dash__price-filter-apply"
            onClick={handleApply}
            disabled={!isDraftDirty}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
