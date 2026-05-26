import { useEffect, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlineUser } from "react-icons/hi2";
import { IoChevronDown } from "react-icons/io5";
import {
  FEED_PAGE_SIZE,
  FEED_SORT_OPTIONS,
  PRODUCT_QUESTIONS,
  PRODUCT_REVIEWS,
  sortProductQuestions,
  sortProductReviews,
} from "./productReviewsQuestions";
import "./ProductReviewsFeed.css";

const LOAD_DELAY_MS = 750;

function FeedStars({ value }) {
  return (
    <span className="spd-feed__stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "spd-feed__star spd-feed__star--filled" : "spd-feed__star"}>
          ★
        </span>
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="spd-feed__verified" title="Verified purchase">
      Verified
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="spd-feed__avatar" aria-hidden="true">
      <HiOutlineUser />
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <li className="spd-feed__item spd-feed__item--review">
      <div className="spd-feed__review-top">
        <FeedStars value={review.stars} />
        <time className="spd-feed__date" dateTime={review.date}>
          {review.date}
        </time>
      </div>

      <div className="spd-feed__author">
        <UserAvatar />
        <span className="spd-feed__author-name">
          {review.name}
          {review.verified && <VerifiedBadge />}
        </span>
      </div>

      {review.title && <p className="spd-feed__review-title">{review.title}</p>}
      <p className="spd-feed__review-body">{review.body}</p>
    </li>
  );
}

function QuestionCard({ item }) {
  return (
    <li className="spd-feed__item spd-feed__item--question">
      <div className="spd-feed__question-top">
        <div className="spd-feed__author">
          <UserAvatar />
          <span className="spd-feed__author-name">{item.name}</span>
        </div>
        <time className="spd-feed__date" dateTime={item.date}>
          {item.date}
        </time>
      </div>

      <p className="spd-feed__question-text">{item.question}</p>

      {item.reply && (
        <div className="spd-feed__reply">
          <time className="spd-feed__reply-date" dateTime={item.reply.date}>
            {item.reply.date}
          </time>
          <p className="spd-feed__reply-heading">
            &gt;&gt; <strong>{item.reply.author}</strong> replied:
          </p>
          <p className="spd-feed__reply-body">{item.reply.body}</p>
        </div>
      )}
    </li>
  );
}

export default function ProductReviewsFeed() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(FEED_PAGE_SIZE);
  const [visibleQuestions, setVisibleQuestions] = useState(FEED_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const sortedReviews = useMemo(() => sortProductReviews(PRODUCT_REVIEWS, sortBy), [sortBy]);
  const sortedQuestions = useMemo(() => sortProductQuestions(PRODUCT_QUESTIONS), []);

  const visibleReviewItems = sortedReviews.slice(0, visibleReviews);
  const visibleQuestionItems = sortedQuestions.slice(0, visibleQuestions);

  const hasMoreReviews = visibleReviews < sortedReviews.length;
  const hasMoreQuestions = visibleQuestions < sortedQuestions.length;
  const hasMore = activeTab === "reviews" ? hasMoreReviews : hasMoreQuestions;

  const selectedSortLabel =
    FEED_SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Most Recent";

  useEffect(() => {
    if (!sortOpen) return undefined;

    const closeSort = () => setSortOpen(false);
    window.addEventListener("click", closeSort);

    return () => window.removeEventListener("click", closeSort);
  }, [sortOpen]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    window.setTimeout(() => {
      if (activeTab === "reviews") {
        setVisibleReviews((count) => Math.min(count + FEED_PAGE_SIZE, sortedReviews.length));
      } else {
        setVisibleQuestions((count) => Math.min(count + FEED_PAGE_SIZE, sortedQuestions.length));
      }
      setLoadingMore(false);
    }, LOAD_DELAY_MS);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setSortOpen(false);
    setVisibleReviews(FEED_PAGE_SIZE);
  };

  return (
    <div className="spd-feed">
      <div className="spd-feed__tabs" role="tablist" aria-label="Reviews and questions">
        <button
          type="button"
          role="tab"
          id="spd-feed-tab-reviews"
          aria-selected={activeTab === "reviews"}
          aria-controls="spd-feed-panel-reviews"
          className={`spd-feed__tab${activeTab === "reviews" ? " spd-feed__tab--active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({PRODUCT_REVIEWS.length})
        </button>
        <button
          type="button"
          role="tab"
          id="spd-feed-tab-questions"
          aria-selected={activeTab === "questions"}
          aria-controls="spd-feed-panel-questions"
          className={`spd-feed__tab${activeTab === "questions" ? " spd-feed__tab--active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          Questions ({PRODUCT_QUESTIONS.length})
        </button>
      </div>

      {activeTab === "reviews" && (
        <div className="spd-feed__toolbar">
          <div className="spd-feed__sort-wrap">
            <button
              type="button"
              className={`spd-feed__sort-trigger${sortOpen ? " spd-feed__sort-trigger--open" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setSortOpen((open) => !open);
              }}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              aria-label="Sort reviews"
            >
              <span>{selectedSortLabel}</span>
              <IoChevronDown className="spd-feed__sort-chevron" aria-hidden="true" />
            </button>

            {sortOpen && (
              <ul
                className="spd-feed__sort-panel"
                role="listbox"
                aria-label="Sort reviews"
                onClick={(event) => event.stopPropagation()}
              >
                {FEED_SORT_OPTIONS.map(({ value, label }) => (
                  <li key={value} role="option" aria-selected={sortBy === value}>
                    <button
                      type="button"
                      className={`spd-feed__sort-option${sortBy === value ? " spd-feed__sort-option--active" : ""}`}
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
      )}

      <div className="spd-feed__divider" aria-hidden="true" />

      {activeTab === "reviews" ? (
        <ul
          id="spd-feed-panel-reviews"
          role="tabpanel"
          aria-labelledby="spd-feed-tab-reviews"
          className="spd-feed__list"
        >
          {visibleReviewItems.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      ) : (
        <ul
          id="spd-feed-panel-questions"
          role="tabpanel"
          aria-labelledby="spd-feed-tab-questions"
          className="spd-feed__list"
        >
          {visibleQuestionItems.map((item) => (
            <QuestionCard key={item.id} item={item} />
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="spd-feed__load-wrap">
          {loadingMore ? (
            <div className="spd-feed__loading" aria-live="polite" aria-busy="true">
              <CircularProgress size={28} sx={{ color: "var(--primary-dark, #b8860b)" }} />
              <span>Loading more…</span>
            </div>
          ) : (
            <button type="button" className="spd-feed__load-btn" onClick={handleLoadMore}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
