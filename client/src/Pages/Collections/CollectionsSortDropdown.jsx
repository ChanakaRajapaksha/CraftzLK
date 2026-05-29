import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { COLLECTIONS_SORT_OPTIONS } from "./collectionsConstants";

export default function CollectionsSortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selectedLabel =
    COLLECTIONS_SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Featured";

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleSelect = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="collections-sort" ref={wrapRef}>
      <button
        type="button"
        className={`collections-sort__trigger${open ? " collections-sort__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Sort products"
      >
        <span>{selectedLabel}</span>
        <IoChevronDown className="collections-sort__chevron" aria-hidden />
      </button>

      {open && (
        <ul className="collections-sort__panel" role="listbox" aria-label="Sort products">
          {COLLECTIONS_SORT_OPTIONS.map((option) => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <button
                type="button"
                className={`collections-sort__option${value === option.value ? " collections-sort__option--active" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
