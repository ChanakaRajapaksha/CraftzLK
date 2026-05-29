import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { isSampleProductId } from "../../data/sampleProductDetails";
import { MEGA_MENU_COLUMNS } from "../../Components/Header/SecondaryCategoryNav";
import CollectionsFilters from "./CollectionsFilters";
import CollectionsSortDropdown from "./CollectionsSortDropdown";
import CollectionsProductCard from "./CollectionsProductCard";
import { COLLECTIONS_PAGE_SIZE } from "./collectionsConstants";
import { getSampleCollectionsProducts, loadCollectionProducts } from "./collectionsProducts";
import {
  applyProductFilters,
  getPriceBounds,
  sortProducts,
} from "./collectionsUtils";
import "./Collections.css";

const Collections = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState(() => getSampleCollectionsProducts());
  const [loading, setLoading] = useState(false);
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

  const collections = MEGA_MENU_COLUMNS.map((col) => ({
    title: col.title,
    icon: col.icon,
  }));

  const displayProducts = useMemo(() => {
    let list = sortProducts(products, sortBy);
    if (filtersActive) {
      list = applyProductFilters(list, {
        categoryTitle: activeCategory,
        inStockOnly,
        priceRange,
      });
    }
    return list.slice(0, COLLECTIONS_PAGE_SIZE);
  }, [products, sortBy, filtersActive, activeCategory, inStockOnly, priceRange]);

  const totalCount = filtersActive
    ? applyProductFilters(products, { categoryTitle: activeCategory, inStockOnly, priceRange }).length
    : products.length;

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

  const handleQuickReview = (productId) => {
    if (!productId) return;
    if (isSampleProductId(productId)) {
      navigate(`/product/${productId}`);
      return;
    }
    context?.openProductDetailsModal?.(productId, true);
  };

  return (
    <div className="collections-page">
      <div className="collections-page__inner">
        <nav className="collections-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/collections">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="collections-breadcrumb__current">All</span>
        </nav>

        <h1 className="collections-title">All</h1>

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

        <section className="collections-catalog" aria-label="Product catalog">
          <CollectionsFilters
            inStockOnly={inStockOnly}
            onInStockOnlyChange={handleInStockChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            priceBounds={priceBounds}
          />

          <div className="collections-catalog__main">
            <div className="collections-toolbar">
              <CollectionsSortDropdown value={sortBy} onChange={setSortBy} />
              <p className="collections-toolbar__count">
                {loading && <span className="collections-toolbar__loading">Updating… </span>}
                {totalCount.toLocaleString()} product{totalCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="collections-product-grid">
              {displayProducts.map((product, index) => (
                <CollectionsProductCard
                  key={`${product.id || product._id}-${product._gridIndex ?? index}`}
                  product={product}
                  onQuickReview={handleQuickReview}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Collections;
