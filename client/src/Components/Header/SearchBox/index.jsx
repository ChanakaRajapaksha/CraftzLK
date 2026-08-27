import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { IoMdClose } from "react-icons/io";
import { SearchController } from "../../../controllers/index.js";
import { MyContext } from "../../../App";
import { formatRsLabel } from "../../../Pages/Collections/collectionsUtils";

const DEBOUNCE_MS = 300;
const PREVIEW_LIMIT = 5;

const SearchBox = ({ closeSearch }) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [isLoading, setIsLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [results, setResults] = useState({
    products: [],
    suggestions: [],
    totalProducts: 0,
    totalCategories: 0,
  });

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setPopularLoading(true);
    SearchController.getPopular(8)
      .then((res) => {
        setPopularSearches(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => setPopularSearches([]))
      .finally(() => setPopularLoading(false));
  }, []);

  const fetchPreview = useCallback((value) => {
    if (!value.trim()) {
      setResults({
        products: [],
        suggestions: [],
        totalProducts: 0,
        totalCategories: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    SearchController.search(value.trim(), PREVIEW_LIMIT)
      .then((res) => {
        setResults({
          products: res?.products || [],
          suggestions: res?.suggestions || [],
          totalProducts: res?.totalProducts || 0,
          totalCategories: res?.totalCategories || 0,
        });
      })
      .catch(() => {
        setResults({
          products: [],
          suggestions: [],
          totalProducts: 0,
          totalCategories: 0,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const applySearchQuery = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setActiveTab("products");
    fetchPreview(trimmed);
    inputRef.current?.focus();
  };

  const onQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults({
        products: [],
        suggestions: [],
        totalProducts: 0,
        totalCategories: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => fetchPreview(value), DEBOUNCE_MS);
  };

  const viewAllResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    SearchController.search(trimmed).then((res) => {
      context.setSearchData(Array.isArray(res) ? res : res?.products || []);
      closeSearch();
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const handleResultClick = () => {
    closeSearch();
  };

  const getProductPrice = (item) => {
    const price = item?.discountPrice > 0 ? item.discountPrice : item?.price;
    return formatRsLabel(price);
  };

  const hasQuery = query.trim().length > 0;
  const showProducts = activeTab === "products";
  const activeItems = showProducts ? results.products : results.suggestions;
  const totalCount = showProducts ? results.totalProducts : results.totalCategories;

  return (
    <div className="search-panel">
      <div className="search-panel__header">
        <div className="search-panel__input-wrap">
          {!hasQuery && (
            <span className="search-panel__placeholder" aria-hidden="true">
              Search for anything
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            className="search-panel__input"
            placeholder="Search for anything"
            value={query}
            onChange={onQueryChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") viewAllResults();
            }}
            aria-label="Search for anything"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          className="search-panel__close"
          onClick={closeSearch}
          aria-label="Close search panel"
        >
          <IoMdClose />
        </button>
      </div>

      {!hasQuery ? (
        <div className="search-panel__body search-panel__body--popular">
          <h3 className="search-panel__popular-title">Popular searches</h3>
          {popularLoading ? (
            <div className="search-panel__loading">
              <CircularProgress size={24} />
            </div>
          ) : popularSearches.length > 0 ? (
            <ul className="search-panel__popular-list">
              {popularSearches.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="search-panel__popular-item"
                    onClick={() => applySearchQuery(item.query || item.label)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-panel__empty">Start typing to search products and categories.</p>
          )}
        </div>
      ) : (
        <>
          <div className="search-panel__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={showProducts}
              className={`search-panel__tab${showProducts ? " is-active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              Products
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!showProducts}
              className={`search-panel__tab${!showProducts ? " is-active" : ""}`}
              onClick={() => setActiveTab("suggestions")}
            >
              Suggestions
            </button>
          </div>

          <div className="search-panel__body">
            {isLoading ? (
              <div className="search-panel__loading">
                <CircularProgress size={28} />
              </div>
            ) : activeItems.length === 0 ? (
              <p className="search-panel__empty">
                No {showProducts ? "products" : "suggestions"} found for &ldquo;{query.trim()}&rdquo;
              </p>
            ) : showProducts ? (
              <ul className="search-panel__results">
                {results.products.map((item) => (
                  <li key={item.id || item._id} className="search-panel__result">
                    <Link
                      to={`/product/${item.id || item._id}`}
                      className="search-panel__result-link"
                      onClick={handleResultClick}
                    >
                      <div className="search-panel__result-image">
                        {item?.images?.[0] ? (
                          <img src={item.images[0]} alt="" />
                        ) : (
                          <span className="search-panel__result-placeholder" />
                        )}
                      </div>
                      <div className="search-panel__result-info">
                        <h4>{item.name}</h4>
                        <span className="search-panel__result-price">{getProductPrice(item)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="search-panel__results search-panel__results--suggestions">
                {results.suggestions.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="search-panel__result">
                    <Link
                      to={item.href}
                      className="search-panel__result-link"
                      onClick={handleResultClick}
                    >
                      <div className="search-panel__result-image">
                        {item.image ? (
                          <img src={item.image} alt="" />
                        ) : (
                          <span className="search-panel__result-placeholder" />
                        )}
                      </div>
                      <div className="search-panel__result-info">
                        <h4>{item.name}</h4>
                        <span className="search-panel__result-type">
                          {item.type === "subcategory" ? "Subcategory" : "Category"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {totalCount > 0 && (
            <div className="search-panel__footer">
              <button
                type="button"
                className="search-panel__view-all btn-blue btn-round"
                onClick={viewAllResults}
              >
                View all results
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchBox;
