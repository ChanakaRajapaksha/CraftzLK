/** Products shown per page (4 columns × 10 rows) */
export const COLLECTIONS_PER_PAGE = 40;

/** Total products in the collections catalog (~140 across all pages) */
export const COLLECTIONS_CATALOG_SIZE = 140;

/** @deprecated Use COLLECTIONS_PER_PAGE */
export const COLLECTIONS_PAGE_SIZE = COLLECTIONS_PER_PAGE;

export const COLLECTIONS_ALL_PATH = "/collections/all";

export const COLLECTIONS_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "relevant", label: "Most relevant" },
  { value: "best_selling", label: "Best selling" },
  { value: "name_asc", label: "Alphabetically, A-Z" },
  { value: "name_desc", label: "Alphabetically, Z-A" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "date_asc", label: "Date, old to new" },
  { value: "date_desc", label: "Date, new to old" },
];
