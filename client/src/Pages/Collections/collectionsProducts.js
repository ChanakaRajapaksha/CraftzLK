import { COLLECTIONS_PER_PAGE } from "./collectionsConstants";

import { ProductController } from "../../controllers/index.js";



function normalizeName(s) {

  return (s || "")

    .trim()

    .toLowerCase()

    .replace(/['']/g, "'")

    .replace(/\s+/g, " ");

}



function extractProducts(res) {

  if (Array.isArray(res?.products)) return res.products;

  if (Array.isArray(res)) return res;

  return [];

}



function dedupeProducts(list) {

  const seen = new Set();

  return list.filter((p) => {

    const id = p?.id || p?._id;

    if (!id || seen.has(String(id))) return false;

    seen.add(String(id));

    return true;

  });

}



/**

 * Loads active products for the Shop / Collections catalog.

 * Uses the storefront list endpoint with a page size of 12.

 */

export async function loadCollectionProducts() {

  const perPage = COLLECTIONS_PER_PAGE;

  const merged = [];

  let page = 1;

  let totalPages = 1;



  do {

    const res = await ProductController.list({ page, perPage });

    const items = extractProducts(res);

    if (!items.length) break;



    merged.push(...items);

    totalPages = Math.max(1, Number(res?.totalPages) || 1);

    page += 1;

  } while (page <= totalPages && page <= 50);



  return dedupeProducts(merged);

}



export function productMatchesCategoryLabel(product, categoryTitle) {

  if (!categoryTitle) return true;

  const needle = normalizeName(categoryTitle);

  const haystack = [

    product?.category?.name,

    product?.catName,

    product?.subCatName,

  ]

    .filter(Boolean)

    .map(normalizeName);

  return haystack.some(

    (name) => name === needle || name.includes(needle) || needle.includes(name)

  );

}

