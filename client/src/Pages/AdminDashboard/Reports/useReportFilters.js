import { useEffect, useState } from "react";
import CategoryController from "../../../controllers/category.controller.js";
import ProductController from "../../../controllers/product.controller.js";

function mapMainCategories(list) {
  return (list || [])
    .map((category) => {
      const id = category._id || category.id;
      if (!id) return null;
      return {
        _id: id,
        id,
        name: category.name || "Category",
      };
    })
    .filter(Boolean);
}

export function buildReportQueryParams({
  preset,
  customStart,
  customEnd,
  categoryId,
  productId,
  metric,
}) {
  const params = new URLSearchParams({
    preset: preset || "thisMonth",
    categoryId: categoryId || "all",
    productId: productId || "all",
  });

  if (preset === "custom") {
    if (customStart) params.set("customStart", customStart);
    if (customEnd) params.set("customEnd", customEnd);
  }

  if (metric) params.set("metric", metric);

  return params;
}

export default function useReportFilters() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);

    Promise.all([
      CategoryController.getActive(),
      ProductController.getAdminList("perPage=1000&page=1&status=active"),
    ])
      .then(([categoryRes, productRes]) => {
        if (categoryRes?.success === false || productRes?.success === false) {
          throw new Error("Failed to load report filters.");
        }

        setCategories(mapMainCategories(categoryRes?.categoryList || []));
        setProducts(Array.isArray(productRes?.products) ? productRes.products : []);
      })
      .catch(() => {
        setCategories([]);
        setProducts([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, products, loading, loadError };
}
