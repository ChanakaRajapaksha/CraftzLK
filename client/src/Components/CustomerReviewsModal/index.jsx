import { forwardRef, useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Zoom from "@mui/material/Zoom";
import { HiSparkles } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";
import { FaCheck, FaFilter } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { fetchDataFromApi } from "../../utils/api";
import { formatReviewFeedDate } from "../../utils/productReviewUtils";
import {
  FILTER_STAR_OPTIONS,
  REVIEWS_PER_PAGE,
  SORT_OPTIONS,
  STORE_SUMMARY,
} from "./reviewsData";
import "./CustomerReviewsModal.css";

const CRM_TRANSITION_MS = { enter: 300, exit: 240 };
const EMPTY_DISTRIBUTION = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 }));

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

function ApprovedBadge() {
  return (
    <span className="crm-card__verified" title="Approved review" aria-label="Approved review">
      <FaCheck aria-hidden="true" />
    </span>
  );
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

function formatAverage(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "0.0";
  return n.toFixed(1);
}

function formatCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "0";
  return n.toLocaleString("en-US");
}

function reviewBarPercent(count, total) {
  const safeTotal = Number(total) || 0;
  if (!safeTotal) return 0;
  return Math.round((Number(count) / safeTotal) * 1000) / 10;
}

function mapModalReviewItem(review) {
  const images = Array.isArray(review.images)
    ? review.images.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const dateSource = review.dateCreated || review.date;

  return {
    id: review._id || review.id,
    name: review.name || review.customerName || "Customer",
    verified: review.verified === true || review.status === "approved",
    date: formatReviewFeedDate(dateSource),
    stars: Number(review.stars ?? review.customerRating ?? review.rating ?? 0),
    title: review.title || "",
    body: review.body || review.review || review.comment || "",
    product: review.product || review.productName || "Product",
    productImg: review.productImg || images[0] || "",
    productId: review.productId || "",
    images,
  };
}

function buildGetAllUrl({
  page,
  search,
  starFilters,
  sortBy,
  productId,
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(REVIEWS_PER_PAGE));
  params.set("sort", sortBy || "recent");

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (starFilters.length > 0) {
    params.set("stars", starFilters.join(","));
  }

  if (productId) {
    params.set("productId", String(productId));
  }

  return `/api/productReviews/getall?${params.toString()}`;
}

export default function CustomerReviewsModal({
  open,
  onClose,
  averageRating = 0,
  reviewCount = 0,
  productId = null,
}) {
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [starFilters, setStarFilters] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [liveAverage, setLiveAverage] = useState(averageRating);
  const [liveCount, setLiveCount] = useState(reviewCount);
  const [distribution, setDistribution] = useState(EMPTY_DISTRIBUTION);

  const displayAverage = formatAverage(liveAverage);
  const displayCount = formatCount(liveCount);

  useEffect(() => {
    setLiveAverage(averageRating);
    setLiveCount(reviewCount);
  }, [averageRating, reviewCount]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSearchOpen(false);
      setSearchQuery("");
      setDebouncedSearch("");
      setFiltersOpen(false);
      setSortOpen(false);
      setStarFilters([]);
      setSortBy("recent");
      setReviews([]);
      setTotalPages(1);
    }
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

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
  }, [debouncedSearch, starFilters, sortBy, productId]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    setLoading(true);

    const url = buildGetAllUrl({
      page,
      search: debouncedSearch,
      starFilters,
      sortBy,
      productId,
    });

    fetchDataFromApi(url)
      .then((res) => {
        if (cancelled) return;
        if (!res || res.success === false) {
          setReviews([]);
          setTotalPages(1);
          return;
        }

        const list = Array.isArray(res.reviewList) ? res.reviewList : [];
        setReviews(list.map(mapModalReviewItem));
        setTotalPages(Math.max(1, Number(res.totalPages) || 1));

        if (Number.isFinite(Number(res.averageRating))) {
          setLiveAverage(Number(res.averageRating));
        }
        if (Number.isFinite(Number(res.reviewCount))) {
          setLiveCount(Number(res.reviewCount));
        }
        if (Array.isArray(res.distribution) && res.distribution.length) {
          setDistribution(
            [5, 4, 3, 2, 1].map((stars) => {
              const match = res.distribution.find(
                (item) => Number(item.stars) === stars
              );
              return { stars, count: Number(match?.count) || 0 };
            })
          );
        } else {
          setDistribution(EMPTY_DISTRIBUTION);
        }

        if (Number(res.page) && Number(res.page) !== page) {
          setPage(Number(res.page));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReviews([]);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, page, debouncedSearch, starFilters, sortBy, productId]);

  const safePage = Math.min(page, totalPages);

  const pageNumbers = useMemo(
    () => buildPageNumbers(safePage, totalPages),
    [safePage, totalPages]
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
      open={open}
      onClose={onClose}
      className={`customer-reviews-modal${isMobileLayout ? " customer-reviews-modal--mobile" : ""}`}
      aria-labelledby="crm-title"
      maxWidth={false}
      fullScreen={isMobileLayout}
      scroll="paper"
      disableScrollLock
      disableRestoreFocus
      TransitionComponent={CrmDialogTransition}
      TransitionProps={{ timeout: CRM_TRANSITION_MS, appear: false }}
      BackdropProps={{ transitionDuration: CRM_TRANSITION_MS }}
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
            <span className="crm-sidebar__average">{displayAverage}</span>
            <span className="crm-sidebar__total">{displayCount} reviews</span>
          </div>

          <ul className="crm-histogram" aria-label="Rating breakdown">
            {distribution.map(({ stars, count }) => {
              const pct = reviewBarPercent(count, liveCount);
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
              Product and Store Reviews ({displayCount})
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
              {loading ? (
                <li className="crm-empty">Loading reviews...</li>
              ) : reviews.length === 0 ? (
                <li className="crm-empty">No reviews match your search or filters.</li>
              ) : (
                reviews.map((review) => (
                  <li key={review.id} className="crm-card">
                    {review.stars != null && <StarRow filled={review.stars} />}

                    <div className="crm-card__meta">
                      <Avatar name={review.name} />
                      <div className="crm-card__meta-info">
                        <span className="crm-card__name">
                          {review.name}
                          {review.verified && <ApprovedBadge />}
                        </span>
                        <span className="crm-card__date">{review.date}</span>
                      </div>
                    </div>

                    {review.title && <p className="crm-card__title">{review.title}</p>}
                    <p className="crm-card__body">{review.body}</p>

                    {Array.isArray(review.images) && review.images.length > 0 && (
                      <div className="crm-card__images" aria-label="Review photos">
                        {review.images.map((imageUrl, index) => (
                          <a
                            key={`${review.id}-${imageUrl}-${index}`}
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="crm-card__image-link"
                          >
                            <img
                              src={imageUrl}
                              alt={`Photo shared by ${review.name}`}
                              className="crm-card__image"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {(review.product || review.productImg) && (
                      <div className="crm-card__product">
                        {review.productImg ? (
                          <img
                            src={review.productImg}
                            alt=""
                            className="crm-card__product-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <span className="crm-card__product-thumb" aria-hidden="true" />
                        )}
                        <button type="button" className="crm-card__product-link">
                          {review.product}
                        </button>
                      </div>
                    )}
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
              disabled={safePage === 1 || loading}
              aria-label="Previous page"
            >
              ‹
            </button>

            {pageNumbers.map((p, i) =>
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
                  disabled={loading}
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
              disabled={safePage === totalPages || loading}
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
