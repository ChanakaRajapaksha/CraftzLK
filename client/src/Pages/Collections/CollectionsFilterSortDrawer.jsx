import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CollectionsFilterPanels } from "./CollectionsFilters";

export default function CollectionsFilterSortDrawer({
  open,
  onClose,
  productCount,
  inStockOnly,
  onInStockOnlyChange,
  priceRange,
  onPriceRangeChange,
  priceBounds,
  sortBy,
  onSortChange,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = {
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add("collections-filter-drawer-open");

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev.bodyOverflow;
      document.documentElement.style.overflow = prev.htmlOverflow;
      document.body.style.paddingRight = prev.bodyPaddingRight;
      document.body.classList.remove("collections-filter-drawer-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="collections-fs">
      <button
        type="button"
        className="collections-fs__backdrop"
        aria-label="Close filter and sort"
        onClick={onClose}
      />
      <div
        className="collections-fs__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collections-fs-title"
      >
        <header className="collections-fs__header">
          <div className="collections-fs__title-row">
            <h2 id="collections-fs-title" className="collections-fs__title">
              Filter and sort
            </h2>
            <button
              type="button"
              className="collections-fs__close"
              onClick={onClose}
              aria-label="Close filter and sort"
            >
              <span className="collections-fs__close-icon" aria-hidden>
                ×
              </span>
            </button>
          </div>
          <p className="collections-fs__count">
            {productCount.toLocaleString()} product{productCount === 1 ? "" : "s"}
          </p>
        </header>

        <div className="collections-fs__body">
          <CollectionsFilterPanels
            variant="drawer"
            inStockOnly={inStockOnly}
            onInStockOnlyChange={onInStockOnlyChange}
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
            priceBounds={priceBounds}
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
