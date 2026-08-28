import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { MyContext } from "../../App";
import CollectionsFilters from "./CollectionsFilters";
import CollectionsFilterSortDrawer from "./CollectionsFilterSortDrawer";
import CollectionsSortDropdown from "./CollectionsSortDropdown";
import CollectionsProductCard from "./CollectionsProductCard";
import CollectionsPagination from "./CollectionsPagination.jsx";
import {
  COLLECTIONS_ALL_PATH,
  COLLECTIONS_ALL_SLUG,
  COLLECTIONS_PER_PAGE,
  buildCollectionsCategories,
  getCategoryCollectionsPath,
  resolveCategoryTitleFromSlug,
  resolveSubcategoryTitleFromSlug,
} from "./collectionsConstants";
import { loadCollectionProducts } from "./collectionsProducts";
import {
  applyProductFilters,
  getPriceBounds,
  sortProducts,
} from "./collectionsUtils";
import "./Collections.css";

const EMPTY_BOUNDS = { min: 0, max: 100000 };

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
  const { categorySlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const theme = useTheme();
  const isMobileCatalog = useMediaQuery(theme.breakpoints.down("md"));
  const catalogViewRef = useRef(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const categoryList = context?.categoryData || [];
  const categoryIdsKey = useMemo(
    () => categoryList.map((c) => c._id).join(","),
    [categoryList]
  );
  const collectionsCategories = useMemo(
    () => buildCollectionsCategories(categoryList),
    [categoryIdsKey]
  );

  const activeCategoryTitle = useMemo(
    () => resolveCategoryTitleFromSlug(categorySlug, categoryList),
    [categorySlug, categoryList]
  );

  const activeSubcategoryTitle = useMemo(
    () =>
      resolveSubcategoryTitleFromSlug(
        activeCategoryTitle,
        subcategorySlug,
        categoryList
      ),
    [activeCategoryTitle, subcategorySlug, categoryList]
  );

  const pageHeading = activeSubcategoryTitle || activeCategoryTitle || "All";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersActive, setFiltersActive] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceBounds, setPriceBounds] = useState(EMPTY_BOUNDS);
  const [priceRange, setPriceRange] = useState([EMPTY_BOUNDS.min, EMPTY_BOUNDS.max]);

  useEffect(() => {
    window.scrollTo(0, 0);
    context?.setisHeaderFooterShow?.(true);
  }, [context]);

  useEffect(() => {
    context?.refreshCategoryData?.();
  }, [context?.refreshCategoryData]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        context?.refreshCategoryData?.();
      }
    };

    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [context?.refreshCategoryData]);

  useEffect(() => {
    if (!categorySlug) return;
    if (categorySlug !== COLLECTIONS_ALL_SLUG && !activeCategoryTitle) {
      navigate(COLLECTIONS_ALL_PATH, { replace: true });
      return;
    }
    if (subcategorySlug && !activeSubcategoryTitle && activeCategoryTitle) {
      navigate(getCategoryCollectionsPath(activeCategoryTitle), { replace: true });
    }
  }, [
    categorySlug,
    subcategorySlug,
    activeCategoryTitle,
    activeSubcategoryTitle,
    navigate,
  ]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCollectionProducts()
      .then((list) => {
        if (cancelled) return;
        const items = Array.isArray(list) ? list : [];
        setProducts(items);
        const bounds = getPriceBounds(items);
        setPriceBounds(bounds);
        setPriceRange([bounds.min, bounds.max]);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setPriceBounds(EMPTY_BOUNDS);
        setPriceRange([EMPTY_BOUNDS.min, EMPTY_BOUNDS.max]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryIdsKey]);

  useEffect(() => {
    setCurrentPage(1);
    setFiltersActive(false);
    setInStockOnly(false);
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    const bounds = getPriceBounds(products);
    setPriceBounds(bounds);
    setPriceRange([bounds.min, bounds.max]);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = sortProducts(products, sortBy);
    list = applyProductFilters(list, {
      categoryTitle: activeCategoryTitle,
      subcategoryTitle: activeSubcategoryTitle,
      inStockOnly: filtersActive ? inStockOnly : false,
      priceRange: filtersActive ? priceRange : [priceBounds.min, priceBounds.max],
    });
    return list;
  }, [
    products,
    sortBy,
    filtersActive,
    activeCategoryTitle,
    activeSubcategoryTitle,
    inStockOnly,
    priceRange,
    priceBounds,
  ]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / COLLECTIONS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const displayProducts = useMemo(() => {
    const start = (safePage - 1) * COLLECTIONS_PER_PAGE;
    return filteredProducts.slice(start, start + COLLECTIONS_PER_PAGE);
  }, [filteredProducts, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filtersActive, inStockOnly, priceRange]);

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

  const activateFilters = () => {
    if (!filtersActive) {
      const bounds = getPriceBounds(products);
      setPriceBounds(bounds);
      setPriceRange([bounds.min, bounds.max]);
      setFiltersActive(true);
    }
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

  const showEmptyCatalog = !loading && totalCount === 0;

  if (
    (categorySlug && categorySlug !== COLLECTIONS_ALL_SLUG && !activeCategoryTitle) ||
    (subcategorySlug && activeCategoryTitle && !activeSubcategoryTitle)
  ) {
    return null;
  }

  return (
    <div className="collections-page">
      <div className="collections-page__inner">
        <nav className="collections-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={COLLECTIONS_ALL_PATH}>Shop</Link>
          <span aria-hidden="true">/</span>
          {activeSubcategoryTitle ? (
            <>
              <Link to={getCategoryCollectionsPath(activeCategoryTitle)}>
                {activeCategoryTitle}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="collections-breadcrumb__current">
                {activeSubcategoryTitle}
              </span>
            </>
          ) : activeCategoryTitle ? (
            <span className="collections-breadcrumb__current">{activeCategoryTitle}</span>
          ) : (
            <span className="collections-breadcrumb__current">All</span>
          )}
        </nav>

        <h1 className="collections-title">
          {activeCategoryTitle || activeSubcategoryTitle ? (
            pageHeading
          ) : (
            <Link to={COLLECTIONS_ALL_PATH}>All</Link>
          )}
        </h1>

        {collectionsCategories.length > 0 && (
        <div className="collections-categories-wrap">
          <ul className="collections-grid" aria-label="Shop by category">
            {collectionsCategories.map((collection) => {
              const isActive =
                categorySlug === collection.slug && !activeSubcategoryTitle;
              return (
                <li key={collection.id || collection.slug || collection.title}>
                  <Link
                    to={collection.path}
                    className={`collections-pill${isActive ? " collections-pill--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="collections-pill__icon">
                      <img src={collection.icon} alt="" loading="eager" decoding="async" />
                    </span>
                    <span className="collections-pill__label">{collection.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        )}

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

        <section
          className={`collections-catalog${showEmptyCatalog ? " collections-catalog--empty" : ""}`}
          aria-label="Product catalog"
        >
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
              {showEmptyCatalog ? (
                <motion.div
                  key="collections-empty"
                  className="collections-empty"
                  role="status"
                  variants={gridTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="collections-empty__art-wrap">
                    <img
                      src="/images/not_found.svg"
                      alt="No products found"
                      className="collections-empty__art"
                      decoding="async"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`${categorySlug || COLLECTIONS_ALL_SLUG}-${subcategorySlug || "all"}-${safePage}`}
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
              )}
            </AnimatePresence>

            {!showEmptyCatalog && (
              <CollectionsPagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Collections;
