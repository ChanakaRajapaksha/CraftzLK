export function getStockListStats(stockList) {
  return {
    total: stockList.length,
    inStock: stockList.filter((item) => item.stockLevel === "in_stock").length,
    lowStock: stockList.filter((item) => item.stockLevel === "low_stock").length,
    outOfStock: stockList.filter((item) => item.stockLevel === "out_of_stock").length,
  };
}
