import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CollectionsFilterPanels } from "./CollectionsFilters";

const backdropTransition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] };
const panelTransition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };

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
  const reduceMotion = useReducedMotion();

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

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  };

  const backdropMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { variants: backdropVariants, initial: "initial", animate: "animate", exit: "exit", transition: backdropTransition };

  const panelMotion = reduceMotion
    ? { initial: false, animate: { x: 0 }, exit: { x: 0 }, transition: { duration: 0 } }
    : { variants: panelVariants, initial: "initial", animate: "animate", exit: "exit", transition: panelTransition };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="collections-fs" key="collections-filter-sort-drawer">
          <motion.button
            type="button"
            className="collections-fs__backdrop"
            aria-label="Close filter and sort"
            onClick={onClose}
            {...backdropMotion}
          />
          <motion.div
            className="collections-fs__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collections-fs-title"
            onClick={(e) => e.stopPropagation()}
            {...panelMotion}
          >
            <div className="collections-fs__header">
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
            </div>

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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
