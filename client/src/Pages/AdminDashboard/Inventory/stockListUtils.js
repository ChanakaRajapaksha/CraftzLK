import { getProductListSampleData } from "../Products/productListSampleData";
import { getStockLevel } from "./stockUtils";

export function getStockListSampleData() {
  return getProductListSampleData().map((product) => ({
    _id: product._id || product.id,
    id: product._id || product.id,
    name: product.name,
    sku: product.sku || "",
    catName: product.catName || "",
    images: product.images || [],
    countInStock: Number(product.countInStock ?? 0),
    minStockAlert: Number(product.minStockAlert ?? 5),
    stockLevel: getStockLevel(product),
    status: product.status || "active",
  }));
}

export function getStockListSampleStats(stockList) {
  return {
    total: stockList.length,
    inStock: stockList.filter((item) => item.stockLevel === "in_stock").length,
    lowStock: stockList.filter((item) => item.stockLevel === "low_stock").length,
    outOfStock: stockList.filter((item) => item.stockLevel === "out_of_stock").length,
  };
}

export function isSampleStockId(id) {
  return String(id || "").startsWith("sample-p");
}
