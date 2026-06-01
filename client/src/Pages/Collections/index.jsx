import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { MyContext } from "../../App";
import { MEGA_MENU_COLUMNS } from "../../Components/Header/SecondaryCategoryNav";
import CollectionsFilters from "./CollectionsFilters";
import CollectionsFilterSortDrawer from "./CollectionsFilterSortDrawer";
import CollectionsSortDropdown from "./CollectionsSortDropdown";
import CollectionsProductCard from "./CollectionsProductCard";
import CollectionsPagination from "./CollectionsPagination.jsx";
import { COLLECTIONS_ALL_PATH, COLLECTIONS_PER_PAGE } from "./collectionsConstants";
import { getSampleCollectionsProducts, loadCollectionProducts } from "./collectionsProducts";
import {
  applyProductFilters,
  getPriceBounds,
  sortProducts,
} from "./collectionsUtils";
import "./Collections.css";

const gridTransition = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(3px)",
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
};

const Collections = () => {
  const context = useContext(MyContext);
  const theme = useTheme();
  const isMobileCatalog = useMediaQuery(theme.breakpoints.down("md"));
  const catalogViewRef = useRef(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [products, setProducts] = useState(() => getSampleCollectionsProducts());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersActive, setFiltersActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceBounds, setPriceBounds] = useState(() => getPriceBounds(getSampleCollectionsProducts()));
  const [priceRange, setPriceRange] = useState(() => {
    const bounds = getPriceBounds(getSampleCollectionsProducts());
    return [bounds.min, bounds.max];
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);
  }, [context]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCollectionProducts()
      .then((list) => {
        if (cancelled || !list.length) return;
        setProducts(list);
        const bounds = getPriceBounds(list);
        setPriceBounds(bounds);
        setPriceRange([bounds.min, bounds.max]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let list = sortProducts(products, sortBy);
    if (filtersActive) {
      list = applyProductFilters(list, {
        categoryTitle: activeCategory,
        inStockOnly,
        priceRange,
      });
    }
    return list;
  }, [products, sortBy, filtersActive, activeCategory, inStockOnly, priceRange]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / COLLECTIONS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const displayProducts = useMemo(() => {
    const start = (safePage - 1) * COLLECTIONS_PER_PAGE;
    return filteredProducts.slice(start, start + COLLECTIONS_PER_PAGE);
  }, [filteredProducts, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filtersActive, activeCategory, inStockOnly, priceRange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const scrollToCatalogTop = () => {
    catalogViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageChange = (nextPage) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    if (clamped === safePage) return;
    setCurrentPage(clamped);
    requestAnimationFrame(scrollToCatalogTop);
  };

  const collections = MEGA_MENU_COLUMNS.map((col) => ({
    title: col.title,
    icon: col.icon,
  }));

  const activateFilters = () => {
    if (!filtersActive) {
      const bounds = getPriceBounds(products);
      setPriceBounds(bounds);
      setPriceRange([bounds.min, bounds.max]);
      setFiltersActive(true);
    }
  };

  const handleCategorySelect = (title) => {
    activateFilters();
    setActiveCategory((current) => (current === title ? null : title));
  };

  const handleInStockChange = (value) => {
    activateFilters();
    setInStockOnly(value);
  };

  const handlePriceRangeChange = (next) => {
    activateFilters();
    const min = Math.max(priceBounds.min, Math.min(next[0], next[1]));
    const max = Math.min(priceBounds.max, Math.max(next[0], next[1]));
    setPriceRange([min, max]);
  };

  return (
    <div className="collections-page">
      <div className="collections-page__inner">
        <nav className="collections-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={COLLECTIONS_ALL_PATH}>Shop</Link>
          <span aria-hidden="true">/</span>
          <Link to={COLLECTIONS_ALL_PATH} className="collections-breadcrumb__current">
            All
          </Link>
        </nav>

        <h1 className="collections-title">
          <Link to={COLLECTIONS_ALL_PATH}>All</Link>
        </h1>

        <div className="collections-categories-wrap">
          <ul className="collections-grid" aria-label="Shop by category">
            {collections.map((collection) => {
              const isActive = filtersActive && activeCategory === collection.title;
              return (
                <li key={collection.title}>
                  <button
                    type="button"
                    className={`collections-pill${isActive ? " collections-pill--active" : ""}`}
                    onClick={() => handleCategorySelect(collection.title)}
                    aria-pressed={isActive}
                  >
                    <span className="collections-pill__icon">
                      <img src={collection.icon} alt="" loading="eager" decoding="async" />
                    </span>
                    <span className="collections-pill__label">{collection.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {isMobileCatalog && (
          <div className="collections-mobile-actions">
            <p className="collections-mobile-actions__count">
              {loading && <span className="collections-toolbar__loading">Updating… </span>}
              {totalCount.toLocaleString()} product{totalCount === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              className="collections-filter-sort-btn"
              onClick={() => setFilterDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              <HiOutlineAdjustmentsHorizontal className="collections-filter-sort-btn__icon" aria-hidden />
              Filter and sort
            </button>
          </div>
        )}

        <CollectionsFilterSortDrawer
          open={isMobileCatalog && filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          productCount={totalCount}
          inStockOnly={inStockOnly}
          onInStockOnlyChange={handleInStockChange}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          priceBounds={priceBounds}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div ref={catalogViewRef} className="collections-view-anchor" aria-hidden="true" />

        <section className="collections-catalog" aria-label="Product catalog">
          {!isMobileCatalog && (
            <CollectionsFilters
              inStockOnly={inStockOnly}
              onInStockOnlyChange={handleInStockChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              priceBounds={priceBounds}
            />
          )}

          <div className="collections-catalog__main">
            {!isMobileCatalog && (
              <div className="collections-toolbar">
                <CollectionsSortDropdown value={sortBy} onChange={setSortBy} />
                <p className="collections-toolbar__count">
                {loading && <span className="collections-toolbar__loading">Updating… </span>}
                {totalCount.toLocaleString()} product{totalCount === 1 ? "" : "s"}
                {totalPages > 1 && (
                  <span className="collections-toolbar__page-hint">
                    {" "}
                    · Page {safePage} of {totalPages}
                  </span>
                )}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={safePage}
                className="collections-product-grid"
                role="list"
                aria-label={`Products page ${safePage}`}
                variants={gridTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {displayProducts.map((product, index) => (
                  <CollectionsProductCard
                    key={`${product.id || product._id}-${(safePage - 1) * COLLECTIONS_PER_PAGE + index}`}
                    product={product}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <CollectionsPagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Collections;
