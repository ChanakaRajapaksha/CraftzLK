import { SAMPLE_PRODUCT_CATALOG } from "../../data/sampleProductDetails";
import { MEGA_MENU_COLUMNS } from "../../data/megaMenuCategories";
import { COLLECTIONS_CATALOG_SIZE } from "./collectionsConstants";
import { fetchDataFromApi } from "../../utils/api";

function normalizeName(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ");
}

function buildCategoryColumns(categoryList) {
  if (Array.isArray(categoryList) && categoryList.length > 0) {
    return categoryList.map((cat) => ({
      title: cat.name,
      items: (cat.children || []).map((child) => child.name).filter(Boolean),
    }));
  }

  return MEGA_MENU_COLUMNS.map((col) => ({
    title: col.title,
    items: col.items,
  }));
}

function resolveCategoryColumn(catName, index, categoryColumns) {
  const needle = normalizeName(catName);
  return (
    categoryColumns.find((col) => normalizeName(col.title) === needle) ??
    categoryColumns[index % categoryColumns.length]
  );
}

function extractProducts(res) {
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res)) return res;
  return [];
}

/** Same catalog as Homepage rails — fills up to `count` products */
export function getSampleCollectionsProducts(
  count = COLLECTIONS_CATALOG_SIZE,
  categoryList = []
) {
  const catalog = Object.values(SAMPLE_PRODUCT_CATALOG);
  if (!catalog.length) return [];

  const categoryColumns = buildCategoryColumns(categoryList);

  return Array.from({ length: count }, (_, index) => {
    const base = catalog[index % catalog.length];
    const column = categoryColumns[index % categoryColumns.length];
    return {
      ...base,
      _gridIndex: index,
      catName: column.title,
      subCatName: column.items[index % Math.max(column.items.length, 1)] || column.title,
    };
  });
}

function dedupeProducts(list) {
  const seen = new Set();
  return list.filter((p) => {
    const id = p?.id || p?._id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function buildProductsUrl(page, perPage, withLocation) {
  const location = localStorage.getItem("location") || "All";
  let url = `/api/products?page=${page}&perPage=${perPage}`;
  if (withLocation && location) {
    url += `&location=${encodeURIComponent(location)}`;
  }
  return url;
}

async function fetchProductBatch(withLocation) {
  const merged = [];
  const perPage = 40;
  const maxPages = 8;

  for (let page = 1; page <= maxPages && merged.length < COLLECTIONS_CATALOG_SIZE; page += 1) {
    const res = await fetchDataFromApi(buildProductsUrl(page, perPage, withLocation));
    const items = extractProducts(res);
    if (!items.length) break;
    merged.push(...items);
    if (items.length < perPage) break;
  }

  return dedupeProducts(merged);
}

function assignCategoryLabels(list, categoryList) {
  const categoryColumns = buildCategoryColumns(categoryList);
  const categoryTitles = categoryColumns.map((col) => col.title);

  return (list || []).map((product, index) => {
    const catName =
      product?.catName ||
      product?.category?.name ||
      categoryTitles[index % Math.max(categoryTitles.length, 1)];
    const column = resolveCategoryColumn(catName, index, categoryColumns);
    const subCatName =
      product?.subCatName ||
      product?.subcategory?.name ||
      column.items[index % Math.max(column.items.length, 1)];

    return {
      ...product,
      catName: column.title,
      subCatName,
    };
  });
}

function fillCatalogToSize(list, targetSize, categoryList) {
  if (list.length >= targetSize) {
    return assignCategoryLabels(list.slice(0, targetSize), categoryList);
  }

  const samples = getSampleCollectionsProducts(targetSize, categoryList);
  const merged = dedupeProducts([...list, ...samples]);
  return assignCategoryLabels(merged.slice(0, targetSize), categoryList);
}

export async function loadCollectionProducts(categoryList = []) {
  try {
    let apiList = await fetchProductBatch(true);
    if (apiList.length < COLLECTIONS_CATALOG_SIZE) {
      const withoutLoc = await fetchProductBatch(false);
      apiList = dedupeProducts([...apiList, ...withoutLoc]);
    }

    if (apiList.length > 0) {
      return fillCatalogToSize(apiList, COLLECTIONS_CATALOG_SIZE, categoryList);
    }
  } catch {
    /* fall through */
  }

  try {
    const res = await fetchDataFromApi("/api/products");
    const all = dedupeProducts(extractProducts(res));
    if (all.length > 0) {
      return fillCatalogToSize(all, COLLECTIONS_CATALOG_SIZE, categoryList);
    }
  } catch {
    /* fall through */
  }

  return getSampleCollectionsProducts(COLLECTIONS_CATALOG_SIZE, categoryList);
}
