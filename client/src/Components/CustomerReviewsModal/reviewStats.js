/** Shared review summary data for home section + modal */
export const REVIEW_AVERAGE = 4.9;
export const REVIEW_TOTAL = 8720;
export const REVIEW_TOTAL_LABEL = REVIEW_TOTAL.toLocaleString("en-US");

export const REVIEW_DISTRIBUTION = [
  { stars: 5, count: 7412 },
  { stars: 4, count: 785 },
  { stars: 3, count: 174 },
  { stars: 2, count: 87 },
  { stars: 1, count: 262 },
];

export function reviewBarPercent(count) {
  return Math.round((count / REVIEW_TOTAL) * 1000) / 10;
}
