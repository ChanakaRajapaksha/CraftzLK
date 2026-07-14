import { MEGA_MENU_COLUMNS } from "../../data/megaMenuCategories";

/** Products shown per page (matches storefront GET /api/products page limit) */
export const COLLECTIONS_PER_PAGE = 12;

/** @deprecated Catalog is loaded from the live products API */
export const COLLECTIONS_CATALOG_SIZE = 12;

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
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LEGACY_ICON_BY_SLUG = Object.fromEntries(
  MEGA_MENU_COLUMNS.map((col) => [categoryTitleToSlug(col.title), col.icon])
);

export function findCategoryBySlug(slug, categoryList) {
  if (!slug || slug === COLLECTIONS_ALL_SLUG) return null;
  return (
    (categoryList || []).find(
      (cat) => categoryTitleToSlug(cat?.name) === slug || cat?.slug === slug
    ) ?? null
  );
}

export function findSubcategoryBySlug(parentSlug, subSlug, categoryList) {
  const parent = findCategoryBySlug(parentSlug, categoryList);
  if (!parent || !subSlug) return null;
  return (
    (parent.children || []).find(
      (child) =>
        categoryTitleToSlug(child?.name) === subSlug || child?.slug === subSlug
    ) ?? null
  );
}

/** Resolve a route slug back to the canonical category title, or null if unknown */
export function resolveCategoryTitleFromSlug(slug, categoryList = []) {
  if (!slug || slug === COLLECTIONS_ALL_SLUG) return null;

  const fromApi = findCategoryBySlug(slug, categoryList);
  if (fromApi?.name) return fromApi.name;

  const legacy = MEGA_MENU_COLUMNS.find(
    (col) => categoryTitleToSlug(col.title) === slug
  );
  return legacy?.title ?? null;
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
export function resolveSubcategoryTitleFromSlug(categoryTitle, subSlug, categoryList = []) {
  if (!categoryTitle || !subSlug) return null;

  const parentSlug = categoryTitleToSlug(categoryTitle);
  const fromApi = findSubcategoryBySlug(parentSlug, subSlug, categoryList);
  if (fromApi?.name) return fromApi.name;

  const column = MEGA_MENU_COLUMNS.find((col) => col.title === categoryTitle);
  if (!column) return null;
  return (
    column.items.find((item) => categoryTitleToSlug(item) === subSlug) ?? null
  );
}

export function getCategoryIcon(category) {
  const slug = categoryTitleToSlug(category?.name);
  return (
    category?.images?.[0] ||
    LEGACY_ICON_BY_SLUG[slug] ||
    MEGA_MENU_COLUMNS[0]?.icon ||
    "/icons/handmade_crafts.png"
  );
}

/** Build browse pills from admin/API category tree (active categories from context). */
export function buildCollectionsCategories(categoryList = []) {
  if (!categoryList.length) {
    return MEGA_MENU_COLUMNS.map((col) => ({
      title: col.title,
      icon: col.icon,
      slug: categoryTitleToSlug(col.title),
      path: getCategoryCollectionsPath(col.title),
    }));
  }

  return categoryList.map((cat) => ({
    title: cat.name,
    icon: getCategoryIcon(cat),
    slug: categoryTitleToSlug(cat.name),
    path: getCategoryCollectionsPath(cat.name),
    id: cat._id,
    color: cat.color,
    description: cat.description,
    children: cat.children || [],
  }));
}

/** @deprecated Prefer buildCollectionsCategories(context.categoryData) */
export const COLLECTIONS_CATEGORIES = buildCollectionsCategories();
