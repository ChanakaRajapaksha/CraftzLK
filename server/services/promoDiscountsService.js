const mongoose = require('mongoose');
const { PromoDiscount } = require('../models/promoDiscount');
const { Product } = require('../models/products');

function buildVariantKey(productId, variantName, optionLabel) {
  return `${productId}::${variantName || ''}::${optionLabel || ''}`;
}

class PromoDiscountsService {
  mapDiscount(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      name: doc.name,
      type: doc.type,
      discountType: doc.discountType,
      discountValue: doc.discountValue,
      productIds: doc.productIds || [],
      productNames: doc.productNames || [],
      variantTargets: (doc.variantTargets || []).map((target) => ({
        productId: String(target.productId || ''),
        productName: target.productName || '',
        variantName: target.variantName || '',
        optionLabel: target.optionLabel || '',
        optionId: target.optionId ? String(target.optionId) : '',
        originalPrice: Number(target.originalPrice) || 0,
        selectionKey: buildVariantKey(
          target.productId,
          target.variantName,
          target.optionLabel
        ),
      })),
      categoryId: doc.categoryId || '',
      categoryName: doc.categoryName || '',
      description: doc.description || '',
      source: doc.source || 'promo_module',
      sourceProductId: doc.sourceProductId || '',
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status || 'active',
      dateCreated: doc.createdAt,
    };
  }

  normalizeVariantTargets(targets = []) {
    return (targets || [])
      .map((target) => ({
        productId: String(target.productId || ''),
        productName: target.productName || '',
        variantName: target.variantName || '',
        optionLabel: target.optionLabel || '',
        optionId: target.optionId ? String(target.optionId) : '',
        originalPrice: Number(target.originalPrice) || 0,
      }))
      .filter((target) => target.productId && target.optionLabel);
  }

  deriveStatus(discount) {
    if (discount.status === 'inactive') return 'inactive';
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) return 'scheduled';
    if (discount.endDate) {
      const end = new Date(discount.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) return 'expired';
    }
    return discount.status || 'active';
  }

  shouldApplyDiscount(discount) {
    return this.deriveStatus(discount) === 'active';
  }

  getBasePrice(product) {
    const price = Number(product.price) || 0;
    const oldPrice = Number(product.oldPrice) || 0;
    return oldPrice > price ? oldPrice : price;
  }

  calculateSalePrice(basePrice, discountType, discountValue) {
    const base = Number(basePrice) || 0;
    if (discountType === 'fixed') {
      return Math.max(0, Math.round((base - (Number(discountValue) || 0)) * 100) / 100);
    }
    const percent = Number(discountValue) || 0;
    return Math.round(base * (1 - percent / 100) * 100) / 100;
  }

  calculateProductPricing(product, discountType, discountValue) {
    const basePrice = this.getBasePrice(product);
    const salePrice = this.calculateSalePrice(basePrice, discountType, discountValue);
    const discountPercent =
      discountType === 'percentage'
        ? Number(discountValue) || 0
        : basePrice
          ? Math.round(((basePrice - salePrice) / basePrice) * 100)
          : 0;

    return {
      oldPrice: basePrice,
      price: salePrice,
      discountPrice: salePrice,
      discount: discountPercent,
      discountType,
    };
  }

  captureProductSnapshot(product) {
    const snapshot = {
      productId: String(product._id),
      price: Number(product.price) || 0,
      oldPrice: Number(product.oldPrice) || 0,
      discount: Number(product.discount) || 0,
      discountPrice: Number(product.discountPrice) || 0,
      discountType: product.discountType || 'percentage',
      variants: [],
    };

    for (const group of product.variants || []) {
      for (const option of group.options || []) {
        if (!option.label) continue;
        snapshot.variants.push({
          variantName: group.variantName || '',
          optionLabel: option.label || '',
          optionId: option._id ? String(option._id) : '',
          price: Number(option.price) || 0,
        });
      }
    }

    return snapshot;
  }

  findVariantOption(product, target) {
    for (const group of product.variants || []) {
      for (const option of group.options || []) {
        const optionId = option._id ? String(option._id) : '';
        const matchesId = target.optionId && optionId && optionId === String(target.optionId);
        const matchesLabel =
          String(group.variantName || '') === String(target.variantName || '') &&
          String(option.label || '') === String(target.optionLabel || '');
        if (matchesId || matchesLabel) {
          return { group, option };
        }
      }
    }
    return null;
  }

  restoreProductSnapshot(snapshot) {
    if (!snapshot?.productId) return Promise.resolve();

    return Product.findById(snapshot.productId).then(async (product) => {
      if (!product) return;

      product.price = Number(snapshot.price) || 0;
      product.oldPrice = Number(snapshot.oldPrice) || 0;
      product.discount = Number(snapshot.discount) || 0;
      product.discountPrice = Number(snapshot.discountPrice) || 0;
      product.discountType = snapshot.discountType || 'percentage';

      let changedVariants = false;
      for (const variantSnapshot of snapshot.variants || []) {
        const found = this.findVariantOption(product, variantSnapshot);
        if (!found) continue;
        found.option.price = Number(variantSnapshot.price) || 0;
        changedVariants = true;
      }

      if (changedVariants) {
        product.markModified('variants');
      }

      await product.save();
    });
  }

  async resolveTargetProductIds(discount) {
    if (discount.type === 'product') {
      return this.getWholeProductIds(discount);
    }

    if (discount.type === 'category') {
      const catId = String(discount.categoryId || '');
      if (!catId) return [];

      const catOr = [{ catId }];
      if (mongoose.Types.ObjectId.isValid(catId)) {
        catOr.push({ category: new mongoose.Types.ObjectId(catId) });
      }

      const products = await Product.find({ $or: catOr }).select('_id');
      return products.map((item) => String(item._id));
    }

    if (discount.type === 'seasonal') {
      const products = await Product.find({ status: 'active' }).select('_id');
      return products.map((item) => String(item._id));
    }

    return [];
  }

  getWholeProductIds(discount) {
    const variantProductIds = new Set(
      (discount.variantTargets || []).map((target) => String(target.productId || ''))
    );
    return (discount.productIds || [])
      .map(String)
      .filter((id) => id && !variantProductIds.has(id));
  }

  async applyDiscountToProductRecord(product, discount, { includeAllVariants = false } = {}) {
    const snapshot = this.captureProductSnapshot(product);
    const pricing = this.calculateProductPricing(
      product,
      discount.discountType,
      discount.discountValue
    );

    product.oldPrice = pricing.oldPrice;
    product.price = pricing.price;
    product.discountPrice = pricing.discountPrice;
    product.discount = pricing.discount;
    product.discountType = pricing.discountType;

    if (includeAllVariants) {
      for (const group of product.variants || []) {
        for (const option of group.options || []) {
          if (!option.label) continue;
          const basePrice = Number(option.price) || 0;
          option.price = this.calculateSalePrice(
            basePrice,
            discount.discountType,
            discount.discountValue
          );
        }
      }
      if ((product.variants || []).length) {
        product.markModified('variants');
      }
    }

    await product.save();
    return snapshot;
  }

  async applyDiscountToVariantTargets(discount) {
    const targets = this.normalizeVariantTargets(discount.variantTargets);
    if (!targets.length) return targets;

    const byProduct = targets.reduce((acc, target) => {
      if (!acc[target.productId]) acc[target.productId] = [];
      acc[target.productId].push(target);
      return acc;
    }, {});

    const updatedTargets = [];

    for (const [productId, productTargets] of Object.entries(byProduct)) {
      const product = await Product.findById(productId);
      if (!product) continue;

      let changed = false;

      for (const target of productTargets) {
        const found = this.findVariantOption(product, target);
        if (!found) {
          updatedTargets.push(target);
          continue;
        }

        const basePrice = Number(found.option.price) || 0;
        found.option.price = this.calculateSalePrice(
          basePrice,
          discount.discountType,
          discount.discountValue
        );
        changed = true;

        updatedTargets.push({
          ...target,
          optionId: found.option._id ? String(found.option._id) : target.optionId,
          originalPrice: basePrice,
        });
      }

      if (changed) {
        product.markModified('variants');
        await product.save();
      }
    }

    return updatedTargets;
  }

  async clearVariantTargets(discount) {
    const targets = this.normalizeVariantTargets(discount.variantTargets);
    if (!targets.length) return;

    const byProduct = targets.reduce((acc, target) => {
      if (!acc[target.productId]) acc[target.productId] = [];
      acc[target.productId].push(target);
      return acc;
    }, {});

    for (const [productId, productTargets] of Object.entries(byProduct)) {
      const product = await Product.findById(productId);
      if (!product) continue;

      let changed = false;
      for (const target of productTargets) {
        const found = this.findVariantOption(product, target);
        if (!found) continue;
        if (Number(target.originalPrice) > 0) {
          found.option.price = Number(target.originalPrice);
          changed = true;
        }
      }

      if (changed) {
        product.markModified('variants');
        await product.save();
      }
    }
  }

  async syncProductsFromDiscount(discount) {
    const snapshots = [];

    if (discount.type === 'product') {
      const wholeProductIds = this.getWholeProductIds(discount);

      for (const productId of wholeProductIds) {
        const product = await Product.findById(productId);
        if (!product) continue;
        const snapshot = await this.applyDiscountToProductRecord(product, discount, {
          includeAllVariants: true,
        });
        snapshots.push(snapshot);
      }

      const updatedTargets = await this.applyDiscountToVariantTargets(discount);
      if (updatedTargets.length) {
        discount.variantTargets = updatedTargets;
      }
    } else {
      const includeAllVariants = discount.type === 'category' || discount.type === 'seasonal';
      const productIds = await this.resolveTargetProductIds(discount);

      for (const productId of productIds) {
        const product = await Product.findById(productId);
        if (!product) continue;
        const snapshot = await this.applyDiscountToProductRecord(product, discount, {
          includeAllVariants,
        });
        snapshots.push(snapshot);
      }
    }

    discount.appliedSnapshots = snapshots;
    const affectedProductIds =
      discount.type === 'product'
        ? [
            ...this.getWholeProductIds(discount),
            ...(discount.variantTargets || []).map((target) => String(target.productId || '')),
          ]
        : await this.resolveTargetProductIds(discount);

    if (typeof discount.save === 'function') {
      await discount.save();
    } else if (discount._id) {
      await PromoDiscount.findByIdAndUpdate(discount._id, {
        appliedSnapshots: snapshots,
        variantTargets: discount.variantTargets || [],
      });
    }

    if (discount.source !== 'product_form') {
      await this.markProductsWithPromo(discount, affectedProductIds);
    }
  }

  async markProductPromoMeta(productId, discount) {
    if (!productId || !discount) return;
    await Product.findByIdAndUpdate(productId, {
      promoDiscountId: String(discount._id || discount.id || ''),
      promoDiscountName: discount.name || '',
      promoDiscountType: discount.type || 'product',
    });
  }

  async clearProductPromoMeta(productId) {
    if (!productId) return;
    await Product.findByIdAndUpdate(productId, {
      promoDiscountId: '',
      promoDiscountName: '',
      promoDiscountType: '',
    });
  }

  extractProductDiscountMeta(product) {
    const price = Number(product.price) || 0;
    const oldPrice = Number(product.oldPrice) || 0;
    const discount = Number(product.discount) || 0;
    const discountPrice = Number(product.discountPrice) || 0;
    const discountType = product.discountType || 'percentage';

    const hasSale =
      discount > 0 ||
      (oldPrice > price && price > 0) ||
      (discountPrice > 0 && oldPrice > discountPrice);

    if (!hasSale) return null;

    if (discountType === 'fixed') {
      const basePrice = oldPrice > price ? oldPrice : Math.max(price, discountPrice);
      const discountValue =
        oldPrice > price
          ? Math.round((oldPrice - price) * 100) / 100
          : Math.max(0, Math.round((basePrice - (discountPrice || price)) * 100) / 100);
      return { discountType: 'fixed', discountValue: discountValue || discount };
    }

    const discountValue =
      discount ||
      (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);

    return { discountType: 'percentage', discountValue };
  }

  async syncFromProduct(product) {
    const productId = String(product._id || product.id || '');
    if (!productId) return null;

    const meta = this.extractProductDiscountMeta(product);
    const existing = await PromoDiscount.findOne({
      source: 'product_form',
      sourceProductId: productId,
    });

    if (!meta) {
      if (existing) {
        await PromoDiscount.findByIdAndDelete(existing._id);
      }
      await this.clearProductPromoMeta(productId);
      return null;
    }

    const payload = {
      name: `${product.name} — Product Discount`,
      type: 'product',
      source: 'product_form',
      sourceProductId: productId,
      productIds: [productId],
      productNames: [product.name],
      variantTargets: [],
      discountType: meta.discountType,
      discountValue: meta.discountValue,
      status: 'active',
      startDate: new Date(),
      endDate: null,
    };

    let promo;
    if (existing) {
      promo = await PromoDiscount.findByIdAndUpdate(
        existing._id,
        { ...this.sanitizeBodyByType(payload), source: 'product_form', sourceProductId: productId },
        { new: true }
      );
    } else {
      promo = await PromoDiscount.create({
        ...this.sanitizeBodyByType(payload),
        source: 'product_form',
        sourceProductId: productId,
      });
    }

    await this.markProductPromoMeta(productId, promo);
    return promo;
  }

  async removeBySourceProductId(productId) {
    const existing = await PromoDiscount.findOne({
      source: 'product_form',
      sourceProductId: String(productId),
    });
    if (existing) {
      await PromoDiscount.findByIdAndDelete(existing._id);
    }
    await this.clearProductPromoMeta(productId);
  }

  async markProductsWithPromo(discount, productIds = []) {
    const uniqueIds = [...new Set(productIds.map(String).filter(Boolean))];
    await Promise.all(uniqueIds.map((productId) => this.markProductPromoMeta(productId, discount)));
  }

  async clearProductsForDiscount(discount) {
    if (!discount) return;

    if (discount.type === 'product') {
      await this.clearVariantTargets(discount);
    }

    const snapshots = discount.appliedSnapshots || [];
    for (const snapshot of snapshots) {
      await this.restoreProductSnapshot(snapshot);
      await this.clearProductPromoMeta(snapshot.productId);
    }

    if (discount.type === 'product') {
      for (const target of discount.variantTargets || []) {
        if (target.productId) {
          await this.clearProductPromoMeta(target.productId);
        }
      }
    }
  }

  sanitizeBodyByType(body) {
    const type = body.type || 'product';
    const base = {
      name: body.name,
      type,
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue) || 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || 'active',
      appliedSnapshots: [],
      source: body.source || 'promo_module',
      sourceProductId: body.sourceProductId ? String(body.sourceProductId) : '',
    };

    if (type === 'product') {
      return {
        ...base,
        productIds: (body.productIds || []).map(String).filter(Boolean),
        productNames: body.productNames || [],
        variantTargets: this.normalizeVariantTargets(body.variantTargets),
        categoryId: '',
        categoryName: '',
        description: '',
      };
    }

    if (type === 'category') {
      return {
        ...base,
        productIds: [],
        productNames: [],
        variantTargets: [],
        categoryId: body.categoryId || '',
        categoryName: body.categoryName || '',
        description: '',
      };
    }

    return {
      ...base,
      productIds: [],
      productNames: [],
      variantTargets: [],
      categoryId: '',
      categoryName: '',
      description: body.description || '',
    };
  }

  async list() {
    return PromoDiscount.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return PromoDiscount.findById(id);
  }

  async create(body) {
    const entry = new PromoDiscount(this.sanitizeBodyByType(body));
    const saved = await entry.save();

    if (saved.source !== 'product_form' && this.shouldApplyDiscount(saved)) {
      await this.syncProductsFromDiscount(saved);
    } else if (saved.source === 'product_form' && saved.sourceProductId) {
      await this.markProductPromoMeta(saved.sourceProductId, saved);
    }

    return saved;
  }

  async update(id, body) {
    const previous = await PromoDiscount.findById(id);
    const updated = await PromoDiscount.findByIdAndUpdate(
      id,
      this.sanitizeBodyByType(body),
      { new: true }
    );

    if (!updated) return null;

    if (previous) {
      await this.clearProductsForDiscount(previous);
    }

    if (updated.source !== 'product_form' && this.shouldApplyDiscount(updated)) {
      await this.syncProductsFromDiscount(updated);
    } else if (updated.source === 'product_form' && updated.sourceProductId) {
      const product = await Product.findById(updated.sourceProductId);
      if (product && this.shouldApplyDiscount(updated)) {
        await this.applyDiscountToProductRecord(product, updated, { includeAllVariants: true });
      }
      await this.markProductPromoMeta(updated.sourceProductId, updated);
    }

    return updated;
  }

  async deleteById(id) {
    const existing = await PromoDiscount.findById(id);
    if (existing) {
      await this.clearProductsForDiscount(existing);
    }
    return PromoDiscount.findByIdAndDelete(id);
  }
}

module.exports = new PromoDiscountsService();
