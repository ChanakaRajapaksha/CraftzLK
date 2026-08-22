const mongoose = require('mongoose');
const { Product } = require('../models/products');
const { StockAdjustment } = require('../models/stockAdjustment');

function isValidObjectId(value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return false;
  return String(new mongoose.Types.ObjectId(value)) === String(value);
}

function normalizeLineItem(item = {}) {
  return {
    productId: String(item.productId || '').trim(),
    productTitle: item.productTitle || '',
    variant: String(item.variant || item.variantLabel || '').trim(),
    variantSku: String(item.variantSku || '').trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}

function hasVariantOptions(product) {
  return (product.variants || []).some((group) => (group.options || []).length > 0);
}

function findVariantOption(product, { variantLabel = '', variantSku = '' }) {
  const label = String(variantLabel || '').trim().toLowerCase();
  const sku = String(variantSku || '').trim().toLowerCase();

  for (const group of product.variants || []) {
    for (const option of group.options || []) {
      const optionLabel = String(option.label || '').trim().toLowerCase();
      const optionSku = String(option.sku || '').trim().toLowerCase();
      if (sku && optionSku && sku === optionSku) {
        return option;
      }
      if (label && optionLabel && label === optionLabel) {
        return option;
      }
    }
  }

  return null;
}

function resolveStockTarget(product, lineItem) {
  const matchedOption = findVariantOption(product, {
    variantLabel: lineItem.variant,
    variantSku: lineItem.variantSku,
  });

  if (matchedOption) {
    return { type: 'variant', product, option: matchedOption };
  }

  return { type: 'product', product };
}

function syncProductStockFromVariants(product) {
  let total = 0;
  for (const group of product.variants || []) {
    for (const option of group.options || []) {
      total += Number(option.stock ?? 0);
    }
  }

  product.countInStock = total;
  product.stockStatus = total <= 0 ? 'out_of_stock' : 'in_stock';
}

function getAvailableStock(product, lineItem) {
  const target = resolveStockTarget(product, lineItem);
  if (target.type === 'variant') {
    return Number(target.option.stock ?? 0);
  }
  return Number(product.countInStock ?? 0);
}

function applyStockDelta(target, delta) {
  const previousProductStock = Number(target.product.countInStock ?? 0);

  if (target.type === 'variant') {
    const previousVariantStock = Number(target.option.stock ?? 0);
    const nextVariantStock = previousVariantStock + delta;
    if (nextVariantStock < 0) {
      const error = new Error(`Insufficient stock for ${target.product.name}.`);
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    target.option.stock = nextVariantStock;
    target.option.stockStatus = nextVariantStock <= 0 ? 'out_of_stock' : 'in_stock';
    target.product.markModified('variants');
    syncProductStockFromVariants(target.product);

    return {
      previousStock: previousProductStock,
      newStock: Number(target.product.countInStock ?? 0),
    };
  }

  const nextProductStock = previousProductStock + delta;
  if (nextProductStock < 0) {
    const error = new Error(`Insufficient stock for ${target.product.name}.`);
    error.statusCode = 400;
    error.payload = { success: false, message: error.message };
    throw error;
  }

  target.product.countInStock = nextProductStock;
  target.product.stockStatus = nextProductStock <= 0 ? 'out_of_stock' : 'in_stock';

  return {
    previousStock: previousProductStock,
    newStock: nextProductStock,
  };
}

async function recordAdjustment({ product, action, quantity, reason, previousStock, newStock }) {
  await StockAdjustment.create({
    productId: String(product._id),
    productName: product.name,
    action,
    quantity,
    reason,
    previousStock,
    newStock,
  });
}

class StockService {
  async validateOrderStock(products = []) {
    const items = products.map(normalizeLineItem).filter((item) => item.productId);

    for (const lineItem of items) {
      if (!isValidObjectId(lineItem.productId)) continue;

      const product = await Product.findById(lineItem.productId);
      if (!product) continue;

      const available = getAvailableStock(product, lineItem);
      if (lineItem.quantity > available) {
        const label = lineItem.variant ? `${product.name} (${lineItem.variant})` : product.name;
        const error = new Error(`Insufficient stock for ${label}. Available: ${available}.`);
        error.statusCode = 400;
        error.payload = { success: false, message: error.message };
        throw error;
      }
    }
  }

  async adjustOrderStock(products = [], { direction = 'remove', orderLabel = '' } = {}) {
    const items = products.map(normalizeLineItem).filter((item) => item.productId);
    const deltaSign = direction === 'add' ? 1 : -1;
    const action = direction === 'add' ? 'add' : 'remove';
    const reasonPrefix = direction === 'add' ? 'Restored from cancelled order' : 'Order placed';

    for (const lineItem of items) {
      if (!isValidObjectId(lineItem.productId)) continue;

      const product = await Product.findById(lineItem.productId);
      if (!product) continue;

      const target = resolveStockTarget(product, lineItem);
      if (
        target.type === 'product' &&
        hasVariantOptions(product) &&
        (lineItem.variant || lineItem.variantSku)
      ) {
        continue;
      }

      const delta = deltaSign * lineItem.quantity;
      const result = applyStockDelta(target, delta);

      await product.save();

      await recordAdjustment({
        product,
        action,
        quantity: lineItem.quantity,
        reason: orderLabel ? `${reasonPrefix} ${orderLabel}` : reasonPrefix,
        previousStock: result.previousStock,
        newStock: result.newStock,
      });
    }
  }

  async deductForOrder(order) {
    const orderLabel = order.orderNumber || order._id;
    await this.adjustOrderStock(order.products, {
      direction: 'remove',
      orderLabel,
    });
  }

  async restoreForOrder(order) {
    const orderLabel = order.orderNumber || order._id;
    await this.adjustOrderStock(order.products, {
      direction: 'add',
      orderLabel,
    });
  }
}

module.exports = new StockService();
