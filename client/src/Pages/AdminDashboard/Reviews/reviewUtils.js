export const REVIEW_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function formatReviewDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getReviewStatusBadgeClass(status) {
  if (status === "approved") return "completed";
  if (status === "rejected") return "cancelled";
  return "pending";
}

export function normalizeReview(review) {
  return {
    _id: review._id || review.id,
    id: review._id || review.id,
    customerId: review.customerId || "",
    customerName: review.customerName || "Customer",
    email: review.email || "",
    productId: review.productId || "",
    productName: review.productName || "Product",
    title: review.title || "",
    review: review.review || review.comment || "",
    comment: review.review || review.comment || "",
    images: Array.isArray(review.images)
      ? review.images.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    rating: Number(review.rating ?? review.customerRating ?? 0),
    status: review.status || "pending",
    date: review.date || review.dateCreated,
    dateCreated: review.dateCreated || review.date,
  };
}

export function getReviewStatusLabel(status) {
  return REVIEW_STATUSES.find((item) => item.value === status)?.label || status || "Pending";
}
