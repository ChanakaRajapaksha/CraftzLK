function normalizeName(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/\s+/g, " ");
}

export function productMatchesCategory(product, categoryTitle) {
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

export function getPriceBounds(products) {
  const prices = (products || [])
    .map((p) => Number(p?.price))
    .filter((n) => Number.isFinite(n));
  if (prices.length === 0) {
    return { min: 0, max: 100000 };
  }
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

export function sortProducts(products, sortBy) {
  const list = [...(products || [])];

  switch (sortBy) {
    case "name_asc":
      list.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
      break;
    case "name_desc":
      list.sort((a, b) => (b?.name || "").localeCompare(a?.name || ""));
      break;
    case "price_asc":
      list.sort((a, b) => Number(a?.price) - Number(b?.price));
      break;
    case "price_desc":
      list.sort((a, b) => Number(b?.price) - Number(a?.price));
      break;
    case "date_asc":
      list.sort(
        (a, b) =>
          new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime()
      );
      break;
    case "date_desc":
      list.sort(
        (a, b) =>
          new Date(b?.dateCreated || 0).getTime() - new Date(a?.dateCreated || 0).getTime()
      );
      break;
    case "best_selling":
      list.sort((a, b) => Number(b?.countInStock || 0) - Number(a?.countInStock || 0));
      break;
    case "relevant":
      list.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0));
      break;
    case "featured":
    default:
      list.sort((a, b) => {
        const featuredDiff = Number(b?.isFeatured) - Number(a?.isFeatured);
        if (featuredDiff !== 0) return featuredDiff;
        return Number(b?.rating || 0) - Number(a?.rating || 0);
      });
      break;
  }

  return list;
}

export function applyProductFilters(products, { categoryTitle, inStockOnly, priceRange }) {
  let list = [...(products || [])];

  if (categoryTitle) {
    list = list.filter((p) => productMatchesCategory(p, categoryTitle));
  }

  if (inStockOnly) {
    list = list.filter((p) => Number(p?.countInStock) > 0);
  }

  const [minPrice, maxPrice] = priceRange;
  list = list.filter((p) => {
    const price = Number(p?.price);
    if (!Number.isFinite(price)) return true;
    return price >= minPrice && price <= maxPrice;
  });

  return list;
}

export function formatRs(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatRsLabel(amount) {
  return `Rs. ${formatRs(amount)}`;
}

export function getVariantCount(product) {
  const optionLists = [
    product?.colors,
    product?.productRam,
    product?.size,
    product?.productWeight,
  ].filter(Array.isArray);

  const counts = optionLists.map((list) => list.filter(Boolean).length);
  const max = counts.length ? Math.max(...counts) : 0;
  return max > 0 ? max : 1;
}
