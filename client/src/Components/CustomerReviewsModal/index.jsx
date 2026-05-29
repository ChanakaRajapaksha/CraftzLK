import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Zoom from "@mui/material/Zoom";
import { HiSparkles } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";
import { FaFilter } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import {
  REVIEW_AVERAGE,
  REVIEW_DISTRIBUTION,
  REVIEW_TOTAL_LABEL,
  reviewBarPercent,
} from "./reviewStats";
import {
  FILTER_STAR_OPTIONS,
  REVIEWS,
  REVIEWS_PER_PAGE,
  SORT_OPTIONS,
  STORE_SUMMARY,
} from "./reviewsData";
import "./CustomerReviewsModal.css";

const CRM_TRANSITION_MS = { enter: 300, exit: 240 };

/** Warm image cache so first open does not wait on product thumbnails. */
function preloadReviewImages() {
  const urls = [...new Set(REVIEWS.map((r) => r.productImg).filter(Boolean))];
  urls.forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}

const CrmDialogTransition = forwardRef(function CrmDialogTransition(props, ref) {
  return (
    <Zoom
      ref={ref}
      {...props}
      timeout={CRM_TRANSITION_MS}
      easing={{
        enter: "cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      }}
      style={{ transformOrigin: "center center" }}
    />
  );
});

function StarRow({ filled }) {
  return (
    <span className="crm-stars" aria-label={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? "crm-star crm-star--filled" : "crm-star"}>
          ★
        </span>
      ))}
    </span>
  );
}

function Avatar({ name }) {
  return <span className="crm-avatar">{name.charAt(0).toUpperCase()}</span>;
}

function VerifiedBadge() {
  return (
    <span className="crm-card__verified" title="Verified purchase" aria-label="Verified purchase">
      ✓
    </span>
  );
}

function parseReviewDate(dateStr) {
  const [month, day, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function filterAndSortReviews(reviews, { query, starFilters, sortBy }) {
  let result = [...reviews];

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q)
    );
  }

  if (starFilters.length > 0) {
    result = result.filter((r) => starFilters.includes(r.stars));
  }

  if (sortBy === "recent") {
    result.sort((a, b) => parseReviewDate(b.date) - parseReviewDate(a.date));
  } else if (sortBy === "highest") {
    result.sort((a, b) => b.stars - a.stars || parseReviewDate(b.date) - parseReviewDate(a.date));
  } else if (sortBy === "lowest") {
    result.sort((a, b) => a.stars - b.stars || parseReviewDate(b.date) - parseReviewDate(a.date));
  } else if (sortBy === "only_pictures") {
    result = result.filter((r) => r.hasPictures);
    result.sort((a, b) => parseReviewDate(b.date) - parseReviewDate(a.date));
  } else if (sortBy === "pictures_first") {
    result.sort(
      (a, b) =>
        Number(b.hasPictures) - Number(a.hasPictures) ||
        parseReviewDate(b.date) - parseReviewDate(a.date)
    );
  } else if (sortBy === "videos_first") {
    result.sort(
      (a, b) =>
        Number(b.hasVideo) - Number(a.hasVideo) ||
        parseReviewDate(b.date) - parseReviewDate(a.date)
    );
  } else if (sortBy === "most_helpful") {
    result.sort(
      (a, b) =>
        (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0) ||
        parseReviewDate(b.date) - parseReviewDate(a.date)
    );
  }

  return result;
}

function buildPageNumbers(page, totalPages) {
  const pages = [];
  const left = page - 1;
  const right = page + 1;
  let prev = null;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      if (prev && i - prev > 1) pages.push("...");
      pages.push(i);
      prev = i;
    }
  }

  return pages;
}

export default function CustomerReviewsModal({ open, onClose }) {
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [starFilters, setStarFilters] = useState([]);
  const [sortBy, setSortBy] = useState("recent");

  // One-time invisible warm-up: paints + composites the modal during idle so the
  // first real open does not pay the mount/paint/layer cost on the click.
  const [warmOpen, setWarmOpen] = useState(false);
  const warmedRef = useRef(false);
  const isWarming = warmOpen && !open;

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSearchOpen(false);
      setSearchQuery("");
      setFiltersOpen(false);
      setSortOpen(false);
      setStarFilters([]);
      setSortBy("recent");
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => preloadReviewImages(), {
        timeout: 2500,
      });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(preloadReviewImages, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || warmedRef.current) return undefined;
    let idleId;
    let timeoutId;
    const startWarm = () => setWarmOpen(true);
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(startWarm, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(startWarm, 400);
    }
    return () => {
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!warmOpen || open) return undefined;
    const t = window.setTimeout(() => {
      warmedRef.current = true;
      setWarmOpen(false);
    }, 90);
    return () => window.clearTimeout(t);
  }, [warmOpen, open]);

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
    document.body.classList.add("customer-reviews-modal-open");

    return () => {
      document.body.style.overflow = prev.bodyOverflow;
      document.documentElement.style.overflow = prev.htmlOverflow;
      document.body.style.paddingRight = prev.bodyPaddingRight;
      document.body.classList.remove("customer-reviews-modal-open");
    };
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, starFilters, sortBy]);

  const filteredReviews = useMemo(
    () => filterAndSortReviews(REVIEWS, { query: searchQuery, starFilters, sortBy }),
    [searchQuery, starFilters, sortBy]
  );

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filteredReviews.slice(
    (safePage - 1) * REVIEWS_PER_PAGE,
    safePage * REVIEWS_PER_PAGE
  );

  const toggleStarFilter = (star) => {
    setStarFilters((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const clearFilters = () => setStarFilters([]);

  const selectedSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Most recent";

  const handleSortSelect = (value) => {
    setSortBy(value);
    setSortOpen(false);
  };

  return (
    <Dialog
      open={open || warmOpen}
      onClose={onClose}
      keepMounted
      className={`customer-reviews-modal${isMobileLayout ? " customer-reviews-modal--mobile" : ""}${isWarming ? " customer-reviews-modal--warming" : ""}`}
      aria-labelledby="crm-title"
      aria-hidden={isWarming || undefined}
      maxWidth={false}
      fullScreen={isMobileLayout}
      scroll="paper"
      hideBackdrop={isWarming}
      disableScrollLock
      disableRestoreFocus
      disableAutoFocus={isWarming}
      disableEnforceFocus={isWarming}
      TransitionComponent={CrmDialogTransition}
      TransitionProps={{ timeout: isWarming ? 0 : CRM_TRANSITION_MS, appear: false }}
      BackdropProps={{ transitionDuration: isWarming ? 0 : CRM_TRANSITION_MS }}
    >
      <button
        type="button"
        className="close_"
        onClick={onClose}
        aria-label="Close"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div className="crm-layout">
        <aside className="crm-sidebar">
          <h2 id="crm-title" className="crm-sidebar__title">
            Customer reviews
          </h2>

          <div className="crm-sidebar__score">
            <span className="crm-sidebar__average">{REVIEW_AVERAGE}</span>
            <span className="crm-sidebar__total">{REVIEW_TOTAL_LABEL} reviews</span>
          </div>

          <ul className="crm-histogram" aria-label="Rating breakdown">
            {REVIEW_DISTRIBUTION.map(({ stars, count }) => {
              const pct = reviewBarPercent(count);
              return (
                <li key={stars} className="crm-histogram__row">
                  <span className="crm-histogram__label">{stars}</span>
                  <span className="crm-histogram__star" aria-hidden="true">
                    ★
                  </span>
                  <div className="crm-histogram__track" role="presentation" aria-hidden="true">
                    <span className="crm-histogram__fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="crm-histogram__count">{count.toLocaleString("en-US")}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="crm-main">
          <div className="crm-summary">
            <div className="crm-summary__header">
              <span className="crm-summary__heading">Customers say about this store</span>
              <span className="crm-summary__ai-badge">
                <HiSparkles aria-hidden="true" />
                AI-powered review summary based on recent customer reviews
              </span>
            </div>
            <p className="crm-summary__body">{STORE_SUMMARY}</p>
          </div>

          <div className="crm-toolbar">
            <span className="crm-toolbar__tab">
              Product and Store Reviews ({REVIEW_TOTAL_LABEL})
            </span>

            <div className="crm-toolbar__actions">
              <button
                type="button"
                className={`crm-toolbar__icon-btn${searchOpen ? " crm-toolbar__icon-btn--active" : ""}`}
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search reviews"
                aria-expanded={searchOpen}
              >
                <IoIosSearch aria-hidden="true" />
              </button>

              <div className="crm-toolbar__filters-wrap">
                <button
                  type="button"
                  className={`crm-toolbar__pill-btn${filtersOpen ? " crm-toolbar__pill-btn--active" : ""}${starFilters.length ? " crm-toolbar__pill-btn--has-filter" : ""}`}
                  onClick={() => {
                    setFiltersOpen((v) => !v);
                    setSortOpen(false);
                  }}
                  aria-expanded={filtersOpen}
                  aria-haspopup="true"
                >
                  <FaFilter aria-hidden="true" />
                  Filters
                  {starFilters.length > 0 && (
                    <span className="crm-toolbar__filter-count">{starFilters.length}</span>
                  )}
                </button>

                {filtersOpen && (
                  <div className="crm-filters-panel" role="dialog" aria-label="Review filters">
                    <p className="crm-filters-panel__title">Filter by rating</p>
                    <ul className="crm-filters-panel__list">
                      {FILTER_STAR_OPTIONS.map((star) => (
                        <li key={star}>
                          <label className="crm-filters-panel__option">
                            <input
                              type="checkbox"
                              checked={starFilters.includes(star)}
                              onChange={() => toggleStarFilter(star)}
                            />
                            <span className="crm-filters-panel__stars" aria-hidden="true">
                              {Array.from({ length: star }, (_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </span>
                            <span>{star} star{star !== 1 ? "s" : ""}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {starFilters.length > 0 && (
                      <button type="button" className="crm-filters-panel__clear" onClick={clearFilters}>
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="crm-toolbar__sort-wrap">
                <button
                  type="button"
                  className={`crm-toolbar__sort-trigger${sortOpen ? " crm-toolbar__sort-trigger--open" : ""}`}
                  onClick={() => {
                    setSortOpen((v) => !v);
                    setFiltersOpen(false);
                  }}
                  aria-expanded={sortOpen}
                  aria-haspopup="listbox"
                  aria-label="Sort reviews"
                >
                  <span className="crm-toolbar__sort-label">{selectedSortLabel}</span>
                  <IoChevronDown className="crm-toolbar__sort-chevron" aria-hidden="true" />
                </button>

                {sortOpen && (
                  <ul className="crm-sort-panel" role="listbox" aria-label="Sort reviews">
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <li key={value} role="option" aria-selected={sortBy === value}>
                        <button
                          type="button"
                          className={`crm-sort-panel__option${sortBy === value ? " crm-sort-panel__option--active" : ""}`}
                          onClick={() => handleSortSelect(value)}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="crm-search">
              <IoIosSearch className="crm-search__icon" aria-hidden="true" />
              <input
                type="search"
                className="crm-search__input"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="crm-scroll" tabIndex={0} aria-label="Customer reviews list">
            <ul className="crm-list">
              {paged.length === 0 ? (
                <li className="crm-empty">No reviews match your search or filters.</li>
              ) : (
                paged.map((review) => (
                  <li key={review.id} className="crm-card">
                    {review.stars != null && <StarRow filled={review.stars} />}

                    <div className="crm-card__meta">
                      <Avatar name={review.name} />
                      <div className="crm-card__meta-info">
                        <span className="crm-card__name">
                          {review.name}
                          {review.verified && <VerifiedBadge />}
                        </span>
                        <span className="crm-card__date">{review.date}</span>
                      </div>
                    </div>

                    {review.title && <p className="crm-card__title">{review.title}</p>}
                    <p className="crm-card__body">{review.body}</p>

                    <div className="crm-card__product">
                      <img
                        src={review.productImg}
                        alt=""
                        className="crm-card__product-thumb"
                        loading="lazy"
                      />
                      <button type="button" className="crm-card__product-link">
                        {review.product}
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <nav className="crm-pagination" aria-label="Review pages">
            <button
              type="button"
              className="crm-pagination__btn crm-pagination__arrow"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {buildPageNumbers(safePage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="crm-pagination__ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`crm-pagination__btn${p === safePage ? " crm-pagination__btn--active" : ""}`}
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              className="crm-pagination__btn crm-pagination__arrow"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        </div>
      </div>
    </Dialog>
  );
}
