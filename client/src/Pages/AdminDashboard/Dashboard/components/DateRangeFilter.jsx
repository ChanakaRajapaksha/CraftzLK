import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { DATE_PRESETS } from "../dashboardAnalytics";

export default function DateRangeFilter({ value, onChange, customStart, customEnd, onCustomChange }) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(value === "custom");
  const ref = useRef(null);

  const selected = DATE_PRESETS.find((p) => p.id === value) || DATE_PRESETS[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setShowCustom(id === "custom");
    if (id !== "custom") setOpen(false);
  };

  return (
    <div className="admin-dash__date-filter" ref={ref}>
      <button
        type="button"
        className="admin-dash__date-filter-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FaCalendarAlt aria-hidden />
        <span>{selected.label}</span>
        <FaChevronDown className="admin-dash__date-filter-chevron" aria-hidden />
      </button>

      {open && (
        <div className="admin-dash__date-filter-menu" role="listbox">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="option"
              aria-selected={value === preset.id}
              className={`admin-dash__date-filter-option${value === preset.id ? " admin-dash__date-filter-option--active" : ""}`}
              onClick={() => handleSelect(preset.id)}
            >
              {preset.label}
            </button>
          ))}

          {showCustom && (
            <div className="admin-dash__date-filter-custom">
              <label>
                <span>From</span>
                <input
                  type="date"
                  className="admin-dash__input"
                  value={customStart || ""}
                  onChange={(e) => onCustomChange?.({ start: e.target.value, end: customEnd })}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  type="date"
                  className="admin-dash__input"
                  value={customEnd || ""}
                  onChange={(e) => onCustomChange?.({ start: customStart, end: e.target.value })}
                />
              </label>
              <button type="button" className="admin-dash__btn admin-dash__btn--sm" onClick={() => setOpen(false)}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
