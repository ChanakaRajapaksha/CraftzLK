const express = require("express");
const router = express.Router();
const { Product } = require("../models/products");
const { StockAdjustment } = require("../models/stockAdjustment");

function getStockLevel(product) {
  const stock = Number(product.countInStock ?? 0);
  const min = Number(product.minStockAlert ?? 5);
  if (stock <= 0) return "out_of_stock";
  if (stock <= min) return "low_stock";
  return "in_stock";
}

function mapStockItem(product) {
  const stock = Number(product.countInStock ?? 0);
  const minStockAlert = Number(product.minStockAlert ?? 5);
  return {
    _id: product._id,
    id: product._id,
    name: product.name,
    sku: product.sku || "",
    catName: product.catName || "",
    images: product.images || [],
    countInStock: stock,
    minStockAlert,
    stockLevel: getStockLevel(product),
    status: product.status || "active",
  };
}

router.get("/stock", async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    const stockList = products.map(mapStockItem);

    const stats = {
      total: stockList.length,
      inStock: stockList.filter((item) => item.stockLevel === "in_stock").length,
      lowStock: stockList.filter((item) => item.stockLevel === "low_stock").length,
      outOfStock: stockList.filter((item) => item.stockLevel === "out_of_stock").length,
    };

    return res.status(200).json({ success: true, stockList, stats });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load stock list." });
  }
});

router.get("/adjustments", async (req, res) => {
  try {
    const list = await StockAdjustment.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      adjustmentList: list.map((item) => ({
        _id: item._id,
        id: item._id,
        productId: item.productId,
        productName: item.productName,
        action: item.action,
        quantity: item.quantity,
        reason: item.reason,
        previousStock: item.previousStock,
        newStock: item.newStock,
        dateCreated: item.createdAt,
      })),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load adjustments." });
  }
});

router.post("/adjust", async (req, res) => {
  try {
    const { productId, action, quantity, reason } = req.body;
    const qty = Number(quantity);

    if (!productId || !["add", "remove"].includes(action) || !qty || qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid adjustment payload." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const previousStock = Number(product.countInStock ?? 0);
    let newStock = action === "add" ? previousStock + qty : previousStock - qty;
    if (newStock < 0) {
      return res.status(400).json({ success: false, message: "Cannot remove more stock than available." });
    }

    product.countInStock = newStock;
    product.stockStatus = newStock <= 0 ? "out_of_stock" : "in_stock";
    await product.save();

    const adjustment = await StockAdjustment.create({
      productId: String(product._id),
      productName: product.name,
      action,
      quantity: qty,
      reason: reason || "",
      previousStock,
      newStock,
    });

    return res.status(201).json({
      success: true,
      adjustment,
      product: mapStockItem(product),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to adjust stock." });
  }
});

module.exports = router;
