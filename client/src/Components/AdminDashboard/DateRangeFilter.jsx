import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";

export default function DateRangeFilter({
  presets,
  value,
  onChange,
  customStart,
  customEnd,
  onCustomChange,
  onApply,
}) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(value === "custom");
  const ref = useRef(null);

  const selected = presets.find((preset) => preset.id === value) || presets[0];
  const isFiltered = value !== presets[0]?.id;

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setShowCustom(id === "custom");
    if (id !== "custom") {
      onApply?.(id);
      setOpen(false);
    }
  };

  const handleCustomApply = () => {
    onApply?.("custom");
    setOpen(false);
  };

  return (
    <div
      className={`admin-dash__date-filter${isFiltered ? " admin-dash__date-filter--active" : ""}${open ? " admin-dash__date-filter--open" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className="admin-dash__date-filter-btn"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Filter by date range"
      >
        <FaCalendarAlt aria-hidden />
        <span>{selected.label}</span>
        <FaChevronDown className="admin-dash__date-filter-chevron" aria-hidden />
      </button>

      {open && (
        <div className="admin-dash__date-filter-menu" role="listbox">
          {presets.map((preset) => (
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
                  onChange={(event) => onCustomChange?.({ start: event.target.value, end: customEnd })}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  type="date"
                  className="admin-dash__input"
                  value={customEnd || ""}
                  onChange={(event) => onCustomChange?.({ start: customStart, end: event.target.value })}
                />
              </label>
              <button type="button" className="admin-dash__btn admin-dash__btn--sm" onClick={handleCustomApply}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
