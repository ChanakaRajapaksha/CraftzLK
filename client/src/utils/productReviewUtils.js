import {
  FEED_PAGE_SIZE,
  FEED_SORT_OPTIONS,
  PRODUCT_QUESTIONS,
  sortProductQuestions,
} from "../Pages/SampleProductDetails/productReviewsQuestions";

export { FEED_PAGE_SIZE, FEED_SORT_OPTIONS, PRODUCT_QUESTIONS, sortProductQuestions };

export function formatReviewFeedDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function mapApiReviewToFeedItem(review) {
  const dateSource = review.dateCreated || review.date;
  return {
    id: review._id || review.id,
    name: review.customerName || "Customer",
    verified: review.verified === true || review.status === "approved",
    date: formatReviewFeedDate(dateSource),
    dateValue: new Date(dateSource).getTime() || 0,
    stars: Number(review.customerRating ?? review.rating ?? 0),
    title: review.title || "",
    body: review.review || review.comment || "",
    images: Array.isArray(review.images)
      ? review.images.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
  };
}

export function sortFeedReviews(reviews, sortBy) {
  const result = [...reviews];

  if (sortBy === "highest") {
    result.sort(
      (a, b) =>
        b.stars - a.stars ||
        (b.dateValue || 0) - (a.dateValue || 0)
    );
  } else if (sortBy === "lowest") {
    result.sort(
      (a, b) =>
        a.stars - b.stars ||
        (b.dateValue || 0) - (a.dateValue || 0)
    );
  } else {
    result.sort((a, b) => (b.dateValue || 0) - (a.dateValue || 0));
  }

  return result;
}

export function computeReviewStatsFromFeed(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const reviewCount = reviews.length;
  const total = reviews.reduce(
    (sum, item) => sum + Number(item.stars ?? item.customerRating ?? item.rating ?? 0),
    0
  );

  return {
    averageRating: Math.round((total / reviewCount) * 100) / 100,
    reviewCount,
  };
}

export function parseProductReviewsResponse(res) {
  if (!res || res instanceof Error || res?.response || res?.success === false) {
    return { reviews: [], averageRating: 0, reviewCount: 0 };
  }

  const list = Array.isArray(res.reviewList)
    ? res.reviewList
    : Array.isArray(res)
      ? res
      : [];

  const reviews = list.map(mapApiReviewToFeedItem);
  const computed = computeReviewStatsFromFeed(reviews);

  return {
    reviews,
    averageRating:
      Number.isFinite(Number(res.averageRating)) && res.averageRating !== null
        ? Number(res.averageRating)
        : computed.averageRating,
    reviewCount:
      Number.isFinite(Number(res.reviewCount)) && res.reviewCount !== null
        ? Number(res.reviewCount)
        : computed.reviewCount,
  };
}
