import { MEGA_MENU_COLUMNS } from "../../data/megaMenuCategories";

/** Products shown per page (4 columns × 10 rows) */
export const COLLECTIONS_PER_PAGE = 40;

/** Total products in the collections catalog (~140 across all pages) */
export const COLLECTIONS_CATALOG_SIZE = 140;

/** @deprecated Use COLLECTIONS_PER_PAGE */
export const COLLECTIONS_PAGE_SIZE = COLLECTIONS_PER_PAGE;

export const COLLECTIONS_ALL_PATH = "/collections/all";
export const COLLECTIONS_ALL_SLUG = "all";

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

/** URL slug for a category display title, e.g. "Home & Living" → "home-and-living" */
export function categoryTitleToSlug(title) {
  return String(title ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a route slug back to the canonical category title, or null if unknown */
export function resolveCategoryTitleFromSlug(slug) {
  if (!slug || slug === COLLECTIONS_ALL_SLUG) return null;
  const match = MEGA_MENU_COLUMNS.find(
    (col) => categoryTitleToSlug(col.title) === slug
  );
  return match?.title ?? null;
}

/** Path for a category collections page */
export function getCategoryCollectionsPath(title) {
  if (!title) return COLLECTIONS_ALL_PATH;
  return `/collections/${categoryTitleToSlug(title)}`;
}

/** Path for a subcategory collections page under a parent category */
export function getSubcategoryCollectionsPath(parentTitle, subTitle) {
  if (!parentTitle || !subTitle) return COLLECTIONS_ALL_PATH;
  return `/collections/${categoryTitleToSlug(parentTitle)}/${categoryTitleToSlug(subTitle)}`;
}

/** Resolve a subcategory slug to its display title within a parent category */
export function resolveSubcategoryTitleFromSlug(categoryTitle, subSlug) {
  if (!categoryTitle || !subSlug) return null;
  const column = MEGA_MENU_COLUMNS.find((col) => col.title === categoryTitle);
  if (!column) return null;
  return (
    column.items.find((item) => categoryTitleToSlug(item) === subSlug) ?? null
  );
}

export const COLLECTIONS_CATEGORIES = MEGA_MENU_COLUMNS.map((col) => ({
  title: col.title,
  icon: col.icon,
  slug: categoryTitleToSlug(col.title),
  path: getCategoryCollectionsPath(col.title),
}));
