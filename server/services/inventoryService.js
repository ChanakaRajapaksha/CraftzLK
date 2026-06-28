const { Product } = require('../models/products');
const { StockAdjustment } = require('../models/stockAdjustment');

function getStockLevel(product) {
  const stock = Number(product.countInStock ?? 0);
  const min = Number(product.minStockAlert ?? 5);
  if (stock <= 0) return 'out_of_stock';
  if (stock <= min) return 'low_stock';
  return 'in_stock';
}

function mapStockItem(product) {
  const stock = Number(product.countInStock ?? 0);
  const minStockAlert = Number(product.minStockAlert ?? 5);
  return {
    _id: product._id,
    id: product._id,
    name: product.name,
    sku: product.sku || '',
    catName: product.catName || '',
    images: product.images || [],
    countInStock: stock,
    minStockAlert,
    stockLevel: getStockLevel(product),
    status: product.status || 'active',
  };
}

class InventoryService {
  async getStock() {
    const products = await Product.find().sort({ name: 1 });
    const stockList = products.map(mapStockItem);

    const stats = {
      total: stockList.length,
      inStock: stockList.filter((item) => item.stockLevel === 'in_stock').length,
      lowStock: stockList.filter((item) => item.stockLevel === 'low_stock').length,
      outOfStock: stockList.filter((item) => item.stockLevel === 'out_of_stock').length,
    };

    return { stockList, stats };
  }

  async getAdjustments() {
    const list = await StockAdjustment.find().sort({ createdAt: -1 }).limit(50);
    return list.map((item) => ({
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
    }));
  }

  async adjust(body) {
    const { productId, action, quantity, reason } = body;
    const qty = Number(quantity);

    if (!productId || !['add', 'remove'].includes(action) || !qty || qty < 1) {
      const error = new Error('Invalid adjustment payload.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const previousStock = Number(product.countInStock ?? 0);
    const newStock = action === 'add' ? previousStock + qty : previousStock - qty;
    if (newStock < 0) {
      const error = new Error('Cannot remove more stock than available.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    product.countInStock = newStock;
    product.stockStatus = newStock <= 0 ? 'out_of_stock' : 'in_stock';
    await product.save();

    const adjustment = await StockAdjustment.create({
      productId: String(product._id),
      productName: product.name,
      action,
      quantity: qty,
      reason: reason || '',
      previousStock,
      newStock,
    });

    return { adjustment, product: mapStockItem(product) };
  }
}

module.exports = new InventoryService();
