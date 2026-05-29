import { SAMPLE_PRODUCT_CATALOG } from "../../data/sampleProductDetails";
import { COLLECTIONS_PAGE_SIZE } from "./collectionsConstants";
import { fetchDataFromApi } from "../../utils/api";

function extractProducts(res) {
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res)) return res;
  return [];
}

/** Same catalog as Homepage rails — guarantees 40 visible cards on first paint */
export function getSampleCollectionsProducts(count = COLLECTIONS_PAGE_SIZE) {
  const catalog = Object.values(SAMPLE_PRODUCT_CATALOG);
  if (!catalog.length) return [];

  return Array.from({ length: count }, (_, index) => {
    const base = catalog[index % catalog.length];
    return {
      ...base,
      id: base.id,
      _gridIndex: index,
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

export async function loadCollectionProducts() {
  try {
    const res = await fetchDataFromApi("/api/products?page=1&perPage=40");
    const apiList = dedupeProducts(extractProducts(res));
    if (apiList.length >= COLLECTIONS_PAGE_SIZE) {
      return apiList.slice(0, COLLECTIONS_PAGE_SIZE);
    }
    if (apiList.length > 0) {
      const samples = getSampleCollectionsProducts(COLLECTIONS_PAGE_SIZE);
      return dedupeProducts([...apiList, ...samples]).slice(0, COLLECTIONS_PAGE_SIZE);
    }
  } catch {
    /* fall through to sample catalog */
  }

  return getSampleCollectionsProducts(COLLECTIONS_PAGE_SIZE);
}
